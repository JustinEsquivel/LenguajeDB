const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

function toJsDate(v) {
  if (!v) return new Date();
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);

  if (typeof v === 'string') {
    // "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm"
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/);
    if (m) {
      const y = Number(m[1]);
      const mon = Number(m[2]) - 1;
      const d = Number(m[3]);
      const hh = Number(m[4] || 0);
      const mm = Number(m[5] || 0);
      return new Date(y, mon, d, hh, mm, 0);
    }
    const ms = Date.parse(v);
    if (!Number.isNaN(ms)) return new Date(ms);
  }
  // fallback seguro
  return new Date();
}

class Adopcion {
  static async create(data) {
    const jsDate = data.fecha ? new Date(data.fecha) : new Date();
    const r = await callProcedure(
      `BEGIN adopciones_pkg.ins(:fecha,:usuario,:mascota,:p_id); END;`,
      {
        fecha: jsDate,
        usuario: Number(data.usuario),
        mascota: Number(data.mascota),
        p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { id: r.outBinds.p_id, fecha: jsDate.toISOString(), usuario: Number(data.usuario), mascota: Number(data.mascota) };
  }


  // DELETE (revertir adopción) -> adopciones_pkg.del
  static async delete(id) {
    await callProcedure(`BEGIN adopciones_pkg.del(:id); END;`, { id });
    // Trigger/paquete vuelve mascota a 'Disponible'
    return true;
  }

  // UPDATE fecha -> adopciones_pkg.upd_fecha
  static async updateFecha(id, fecha) {
    const jsDate = toJsDate(fecha);
    await callProcedure(
      `BEGIN adopciones_pkg.upd_fecha(:id,:fecha); END;`,
      { id: Number(id), fecha: { val: jsDate, type: oracledb.DATE, dir: oracledb.BIND_IN } }
    );
    return { id, fecha: jsDate.toISOString() };
  }

  // READ (by id) -> adopciones_pkg.get_by_id (cursor)
  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := adopciones_pkg.get_by_id(:p_id); END;`,
      { p_id: id }
    );
    return rows[0] || null;
  }

  // READ (all) -> adopciones_pkg.list_all (cursor)
  static async findAll() {
    return await callFunctionCursor(`BEGIN :rc := adopciones_pkg.list_all; END;`);
  }
}

module.exports = Adopcion;
