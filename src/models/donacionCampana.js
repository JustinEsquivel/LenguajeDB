const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

class DonacionCampana {
  // CREATE -> donaciones_campanas_pkg.ins
  static async create(data) {
    const r = await callProcedure(
      `BEGIN
       donaciones_campanas_pkg.ins(
         TO_DATE(:fecha, 'YYYY-MM-DD'),
         :cantidad,
         :usuario,
         :campana,
         :p_id
       );
     END;`,
      {
        fecha: data.fecha,                 // 'YYYY-MM-DD'
        cantidad: data.cantidad,
        usuario: data.usuario,
        campana: data.campania || data.campana || data["campaña"],
        p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { id: r.outBinds.p_id, ...data };
  }

  // UPDATE -> donaciones_campanas_pkg.upd
  static async update(id, data) {
    await callProcedure(
      `BEGIN
       donaciones_campanas_pkg.upd(
         :id,
         TO_DATE(:fecha, 'YYYY-MM-DD'),
         :cantidad,
         :usuario,
         :campana
       );
     END;`,
      {
        id,
        fecha: data.fecha,                 // 'YYYY-MM-DD'
        cantidad: data.cantidad,
        usuario: data.usuario,
        campana: data.campania || data.campana || data["campaña"]
      }
    );
    return { id, ...data };
  }

  // DELETE -> donaciones_campanas_pkg.del
  static async delete(id) {
    await callProcedure(`BEGIN donaciones_campanas_pkg.del(:id); END;`, { id });
    return true;
  }

  // READ (by id) -> get_by_id (cursor)
  static async findById(id) {
    const rows = await callFunctionCursor(`BEGIN :rc := donaciones_campanas_pkg.get_by_id(:p_id); END;`, { p_id: id });
    return rows[0] || null;
  }

  // LIST by campaña -> list_por_campaña (cursor)
  static async findByCampana(campanaId) {
    return await callFunctionCursor(`BEGIN :rc := donaciones_campanas_pkg.list_por_campaña(:p_id); END;`, { p_id: campanaId });
  }

  // TOTAL by campaña -> total_por_campaña (number)
  static async totalByCampana(campanaId) {
    const r = await callProcedure(
      `BEGIN :out := donaciones_campanas_pkg.total_por_campaña(:p_id); END;`,
      { out: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, p_id: campanaId },
      { autoCommit: false }
    );
    return r.outBinds.out || 0;
  }
}

module.exports = DonacionCampana;
