const oracledb = require('oracledb');
const { getConnection, closeConnection, getNextSeqValue } = require('../config/db');

class Campana {
  // CREATE
  static async create(data) {
    let connection;
    try {
      const seqId = await getNextSeqValue('seq_campanas'); // Asumiendo que tienes esta secuencia
      data.id = seqId;

      connection = await getConnection();
      await connection.execute(
        `INSERT INTO Campanas (id, nombre, descripcion, fecha_inicio, fecha_fin, estado) 
         VALUES (:id, :nombre, :descripcion, :fecha_inicio, :fecha_fin, :estado)`,
        {
          id: data.id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_fin,
          estado: data.estado
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
        `SELECT * FROM Campanas`,
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
        `SELECT * FROM Campanas WHERE id = :id`,
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

  // SEARCH (by nombre)
  static async searchByNombre(nombre) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT * FROM Campanas WHERE LOWER(nombre) LIKE '%' || LOWER(:nombre) || '%'`,
        [nombre],
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
        `UPDATE Campanas 
         SET nombre = :nombre, descripcion = :descripcion, fecha_inicio = :fecha_inicio, fecha_fin = :fecha_fin, estado = :estado
         WHERE id = :id`,
        {
          id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_fin,
          estado: data.estado
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
        `DELETE FROM Campanas WHERE id = :id`,
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

module.exports = Campana;
