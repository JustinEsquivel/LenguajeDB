const oracledb = require('oracledb'); 

const { getConnection, closeConnection, getNextSeqValue } = require('../config/db'); 

  

class Mascota { 

  // CREATE 

  static async create(data) { 

    let connection; 

    try { 

      const seqId = await getNextSeqValue('seq_mascotas'); 

      data.id = seqId; 

  

      connection = await getConnection(); 

      await connection.execute( 

        `INSERT INTO Mascotas (id, nombre, raza, edad, descripcion, foto, estado, usuario)  

         VALUES (:id, :nombre, :raza, :edad, :descripcion, :foto, :estado, :usuario)`, 

        { 

          id: data.id, 

          nombre: data.nombre, 

          raza: data.raza, 

          edad: data.edad, 

          descripcion: data.descripcion, 

          foto: data.foto, 

          estado: data.estado || 'Disponible', 

          usuario: data.usuario 

        }, 

        { autoCommit: true } 

      ); 

      return { ...data }; 

    } catch (err) { 

      throw err; 

    } finally { 

      await closeConnection(connection); 

    } 

  } 

  

  // READ (all) 

  static async findAll() { 

    let connection; 

    try { 

      connection = await getConnection(); 

      const result = await connection.execute( 

        `SELECT m.*, u.nombre as usuario_nombre  

         FROM Mascotas m  

         JOIN Usuarios u ON m.usuario = u.id`, 

        [], 

        { outFormat: oracledb.OBJECT } 

      ); 

      return result.rows; 

    } catch (err) { 

      throw err; 

    } finally { 

      await closeConnection(connection); 

    } 

  } 

  

  // READ (by id) 

  static async findById(id) { 

    let connection; 

    try { 

      connection = await getConnection(); 

      const result = await connection.execute( 

        `SELECT m.*, u.nombre as usuario_nombre  

         FROM Mascotas m  

         JOIN Usuarios u ON m.usuario = u.id  

         WHERE m.id = :id`, 

        [id], 

        { outFormat: oracledb.OBJECT } 

      ); 

      return result.rows[0]; 

    } catch (err) { 

      throw err; 

    } finally { 

      await closeConnection(connection); 

    } 

  } 

  

  // SEARCH (by name) 

  static async searchByName(name) { 

    let connection; 

    try { 

      connection = await getConnection(); 

      const result = await connection.execute( 

        `SELECT m.*, u.nombre as usuario_nombre  

         FROM Mascotas m  

         JOIN Usuarios u ON m.usuario = u.id  

         WHERE LOWER(m.nombre) LIKE '%' || LOWER(:name) || '%'`, 

        { name }, 

        { outFormat: oracledb.OBJECT } 

      ); 

      return result.rows; 

    } catch (err) { 

      throw err; 

    } finally { 

      await closeConnection(connection); 

    } 

  } 

  

  // UPDATE 

  static async update(id, data) { 

    let connection; 

    try { 

      connection = await getConnection(); 

      const result = await connection.execute( 

        `UPDATE Mascotas  

         SET nombre = :nombre, raza = :raza, edad = :edad,  

             descripcion = :descripcion, foto = :foto, estado = :estado,  

             usuario = :usuario 

         WHERE id = :id`, 

        { 

          id, 

          nombre: data.nombre, 

          raza: data.raza, 

          edad: data.edad, 

          descripcion: data.descripcion, 

          foto: data.foto, 

          estado: data.estado, 

          usuario: data.usuario 

        }, 

        { autoCommit: true } 

      ); 

      return result.rowsAffected > 0 ? { id, ...data } : null; 

    } catch (err) { 

      throw err; 

    } finally { 

      await closeConnection(connection); 

    } 

  } 

  

  // DELETE 

  static async delete(id) { 

    let connection; 

    try { 

      connection = await getConnection(); 

      const result = await connection.execute( 

        `DELETE FROM Mascotas WHERE id = :id`, 

        [id], 

        { autoCommit: true } 

      ); 

      return result.rowsAffected > 0; 

    } catch (err) { 

      throw err; 

    } finally { 

      await closeConnection(connection); 

    } 

  } 

  

  // GET mascotas by usuario 

  static async findByUsuario(usuarioId) { 

    let connection; 

    try { 

      connection = await getConnection(); 

      const result = await connection.execute( 

        `SELECT m.*  

         FROM Mascotas m  

         WHERE m.usuario = :usuarioId`, 

        [usuarioId], 

        { outFormat: oracledb.OBJECT } 

      ); 

      return result.rows; 

    } catch (err) { 

      throw err; 

    } finally { 

      await closeConnection(connection); 

    } 

  }

static async findDisponibles() { 

    let connection; 

    try { 

      connection = await getConnection(); 

      const result = await connection.execute( 

        `SELECT m.*, u.nombre as usuario_nombre  

         FROM Mascotas m  

         JOIN Usuarios u ON m.usuario = u.id  

         WHERE m.estado = 'Disponible'`, 

        [], 

        { outFormat: oracledb.OBJECT } 

      ); 

      return result.rows; 

    } catch (err) { 

      throw err; 

    } finally { 

      await closeConnection(connection); 

    } 

  }  

} 

  

module.exports = Mascota; 