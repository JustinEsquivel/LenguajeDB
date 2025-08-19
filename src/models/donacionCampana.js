const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

class DonacionCampana {
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
        fecha: data.fecha,                
        cantidad: data.cantidad,
        usuario: data.usuario,
        campana: data.campania || data.campana || data["campaña"],
        p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { id: r.outBinds.p_id, ...data };
  }

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
        fecha: data.fecha,                 
        cantidad: data.cantidad,
        usuario: data.usuario,
        campana: data.campania || data.campana || data["campaña"]
      }
    );
    return { id, ...data };
  }

  static async delete(id) {
    await callProcedure(`BEGIN donaciones_campanas_pkg.del(:id); END;`, { id });
    return true;
  }

  static async findById(id) {
    const rows = await callFunctionCursor(`BEGIN :rc := donaciones_campanas_pkg.get_by_id(:p_id); END;`, { p_id: id });
    return rows[0] || null;
  }

  static async findByCampana(campanaId) {
    return await callFunctionCursor(`BEGIN :rc := donaciones_campanas_pkg.list_por_campaña(:p_id); END;`, { p_id: campanaId });
  }

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
