const oracledb = require('oracledb');
const { getConnection, closeConnection, getNextSeqValue } = require('../config/db');

class Usuario {
  // CREATE
  static async create(data) {
    let connection;
    try {
      const seqId = await getNextSeqValue('seq_usuarios');
      data.id = seqId;

      connection = await getConnection();
      await connection.execute(
        `INSERT INTO Usuarios (id, nombre, apellido, email, password, telefono, rol) 
         VALUES (:id, :nombre, :apellido, :email, :password, :telefono, :rol)`,
        {
          id: data.id,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: data.password,
          telefono: data.telefono,
          rol: data.rol
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
        `SELECT u.*, r.nombre as rol_nombre 
         FROM Usuarios u 
         JOIN Roles r ON u.rol = r.id`,
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
        `SELECT u.*, r.nombre as rol_nombre 
         FROM Usuarios u 
         JOIN Roles r ON u.rol = r.id 
         WHERE u.id = :id`,
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

  // READ (by email)
  static async findByEmail(email) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.id, u.nombre, u.apellido, u.email, u.password, u.rol 
         FROM Usuarios u 
         WHERE u.email = :email`,
        [email],
        { outFormat: oracledb.OBJECT }
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    } finally {
      await closeConnection(connection);
    }
  }

  // SEARCH (by name or last name)
  static async searchByNameOrLast(name) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.*, r.nombre as rol_nombre 
         FROM Usuarios u 
         JOIN Roles r ON u.rol = r.id 
         WHERE LOWER(u.nombre) LIKE '%' || LOWER(:name) || '%' 
            OR LOWER(u.apellido) LIKE '%' || LOWER(:name) || '%'`,
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
        `UPDATE Usuarios 
         SET nombre = :nombre, apellido = :apellido, email = :email, 
             password = :password, telefono = :telefono, rol = :rol 
         WHERE id = :id`,
        {
          id,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: data.password,
          telefono: data.telefono,
          rol: data.rol
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
        `DELETE FROM Usuarios WHERE id = :id`,
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

  // AUTHENTICATE (manual auth, not used in API login)
  static async authenticate(email, password) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.id, u.nombre, u.apellido, u.email, u.password, u.rol 
         FROM Usuarios u 
         WHERE u.email = :email AND u.password = :password`,
        { email, password },
        { outFormat: oracledb.OBJECT }
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    } finally {
      await closeConnection(connection);
    }
  }
}

module.exports = Usuario;
