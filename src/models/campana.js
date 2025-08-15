// models/campana.js
const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

/** Normaliza/convierte un valor tipo fecha recibido del front a Date JS para oracledb */
function toJsDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  // acepta 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm'
  const s = String(val).trim();
  const withTime = s.length > 10 ? s : `${s}T00:00:00`;
  const d = new Date(withTime);
  if (Number.isNaN(d.getTime())) throw new Error('Fecha inválida');
  return d;
}

class Campana {
  // CREATE -> campanas_pkg.ins
  static async create(data) {
    const plsql = `
    BEGIN
      campanas_pkg.ins(
        :nombre,
        :descripcion,
        TO_DATE(:inicio, 'YYYY-MM-DD'),
        TO_DATE(:fin,     'YYYY-MM-DD'),
        :objetivo,
        :estado,
        :usuario,
        :p_id
      );
    END;`;
    const binds = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      inicio: data.fechaInicio,  // 'YYYY-MM-DD'
      fin: data.fechaFin,     // 'YYYY-MM-DD'
      objetivo: data.objetivo,
      estado: data.estado,
      usuario: data.usuario,
      p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    const r = await callProcedure(plsql, binds);
    return { id: r.outBinds.p_id, ...data };
  }

  // UPDATE -> campanas_pkg.upd
  static async update(id, data) {
    const plsql = `
    BEGIN
      campanas_pkg.upd(
        :id,
        :nombre,
        :descripcion,
        TO_DATE(:inicio, 'YYYY-MM-DD'),
        TO_DATE(:fin,     'YYYY-MM-DD'),
        :objetivo,
        :estado,
        :usuario
      );
    END;`;
    const binds = {
      id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      inicio: data.fechaInicio,  // 'YYYY-MM-DD'
      fin: data.fechaFin,     // 'YYYY-MM-DD'
      objetivo: data.objetivo,
      estado: data.estado,
      usuario: data.usuario
    };
    await callProcedure(plsql, binds);
    return { id, ...data };
  }

  // DELETE -> campanas_pkg.del
  static async delete(id) {
    await callProcedure(`BEGIN campanas_pkg.del(:id); END;`, { id: Number(id) });
    return true;
  }

  // READ (by id) -> campanas_pkg.get_by_id
  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := campanas_pkg.get_by_id(:p_id); END;`,
      { p_id: Number(id) }
    );
    return rows[0] || null;
  }

  // READ (activas) -> campanas_pkg.list_activas
  static async findActivas() {
    return await callFunctionCursor(`BEGIN :rc := campanas_pkg.list_activas; END;`);
  }

  // READ (todas) -> campanas_pkg.list_all
  static async findAll() {
    return await callFunctionCursor(`BEGIN :rc := campanas_pkg.list_all; END;`);
  }

  // Métrica -> campanas_pkg.recaudado_total
  static async totalRecaudado(id) {
    const r = await callProcedure(
      `BEGIN :out := campanas_pkg.recaudado_total(:p_id); END;`,
      { out: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, p_id: Number(id) },
      { autoCommit: false }
    );
    return r.outBinds.out || 0;
  }
}

module.exports = Campana;
