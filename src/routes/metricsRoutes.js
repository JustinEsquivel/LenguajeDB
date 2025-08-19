const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection, closeConnection } = require('../config/db');

router.get('/home', async (req, res) => {
  let cn;
  try {
    cn = await getConnection();
    const q = async (sql) => (await cn.execute(sql)).rows[0][0] || 0;

    const mascotas    = await q(`SELECT COUNT(*) FROM Mascotas`);
    const adopciones  = await q(`SELECT COUNT(*) FROM Adopciones`);
    const voluntarios = await q(`SELECT COUNT(*) FROM Voluntarios WHERE estado='Activo'`);
    const campanias   = await q(`SELECT COUNT(*) FROM "CAMPAÑAS" WHERE estado='Activa'`);

    res.json({ mascotas, adopciones, campanias, voluntarios });
  } catch (e) {
    console.error('metrics/home error:', e);
    res.status(500).json({ error: 'Error obteniendo métricas' });
  } finally {
    await closeConnection(cn);
  }
});

router.get('/dashboard', async (req, res) => {
  let cn;
  try {
    cn = await getConnection();
    const q = async (sql) => (await cn.execute(sql)).rows[0][0] || 0;

    const totMascotas    = await q(`SELECT COUNT(*) FROM Mascotas`);
    const totDisponibles = await q(`SELECT COUNT(*) FROM Mascotas WHERE estado='Disponible'`);
    const totAdoptadas   = await q(`SELECT COUNT(*) FROM Mascotas WHERE estado='Adoptado'`);
    const totAdopciones  = await q(`SELECT COUNT(*) FROM Adopciones`);
    const totCampanias   = await q(`SELECT COUNT(*) FROM "CAMPAÑAS"`);
    const totReportes    = await q(`SELECT COUNT(*) FROM Reportes`);
    const totObservacion = await q(`SELECT COUNT(*) FROM Mascotas WHERE UPPER(estado) IN ('EN OBSERVACION','EN OBSERVACIÓN')`);
    const totTratamiento = await q(`SELECT COUNT(*) FROM Mascotas WHERE UPPER(estado)='EN TRATAMIENTO'`);

    res.json({
      totMascotas, totDisponibles, totAdoptadas,
      totObservacion, totTratamiento,
      totAdopciones, totCampanias, totReportes
    });
  } catch (e) {
    console.error('metrics/dashboard error:', e);
    res.status(500).json({ error: 'Error obteniendo KPIs' });
  } finally {
    await closeConnection(cn);
  }
});

router.get('/recent', async (req, res) => {
  let cn;
  try {
    cn = await getConnection();

    const mascotas = await cn.execute(
      `SELECT ID, NOMBRE, RAZA, ESTADO
         FROM Mascotas
        ORDER BY ID DESC
        FETCH FIRST 5 ROWS ONLY`,
      [],
      { outFormat: oracledb.OBJECT }
    );

    const adopciones = await cn.execute(
      `SELECT A.ID,
              TO_CHAR(A.FECHA, 'YYYY-MM-DD HH24:MI:SS') AS FECHA,
              U.NOMBRE AS USUARIO,
              M.NOMBRE AS MASCOTA
         FROM Adopciones A
         JOIN Usuarios   U ON U.ID = A.USUARIO
         JOIN Mascotas   M ON M.ID = A.MASCOTA
        ORDER BY A.ID DESC
        FETCH FIRST 5 ROWS ONLY`,
      [],
      { outFormat: oracledb.OBJECT }
    );

    res.json({
      mascotas: mascotas.rows,
      adopciones: adopciones.rows
    });
  } catch (e) {
    console.error('metrics/recent error:', e);
    res.status(500).json({ error: 'Error obteniendo recientes' });
  } finally {
    await closeConnection(cn);
  }
});

module.exports = router;
