const oracledb = require('oracledb');
const { getConnection, closeConnection, getNextSeqValue } = require('../config/db');

class Evento {
  // CREATE
  static async create(data) {
    let connection;
    try {
      const seqId = await getNextSeqValue('seq_eventos');
      data.id = seqId;

      connection = await getConnection();
      await connection.execute(
        `INSERT INTO Eventos (id, titulo, descripcion, fecha, ubicacion) 
         VALUES (:id, :titulo, :descripcion, TO_DATE(:fecha, 'YYYY-MM-DD'), :ubicacion)`,
        {
          id: data.id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          fecha: data.fecha,
          ubicacion: data.ubicacion
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
        `SELECT * FROM Eventos ORDER BY fecha DESC`,
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
        `SELECT * FROM Eventos WHERE id = :id`,
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

  // SEARCH (by nombre/título)
  static async searchByNombre(nombre) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT * FROM Eventos 
         WHERE LOWER(titulo) LIKE '%' || LOWER(:nombre) || '%' 
         ORDER BY fecha DESC`,
        { nombre },
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
        `UPDATE Eventos 
         SET titulo = :titulo, descripcion = :descripcion, 
             fecha = TO_DATE(:fecha, 'YYYY-MM-DD'), ubicacion = :ubicacion 
         WHERE id = :id`,
        {
          id,
          titulo: data.titulo,
          descripcion: data.descripcion,
          fecha: data.fecha,
          ubicacion: data.ubicacion
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
        `DELETE FROM Eventos WHERE id = :id`,
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
}

module.exports = Evento;
