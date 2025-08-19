const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

class Reporte {
  static async create(data) {
    const plsql = `
      BEGIN
        reportes_pkg.ins(
          TO_DATE(:fecha, 'YYYY-MM-DD'),
          :usuario,
          :mascota,
          :provincia,
          :canton,
          :distrito,
          :detalles,
          :p_id
        );
      END;`;
    const binds = {
      fecha: String(data.fecha),                              
      usuario: (data.usuario ?? null),                       
      mascota: (data.mascota ?? null),                       
      provincia: data.provincia,
      canton: data.canton,
      distrito: data.distrito,
      detalles: data.detalles,
      p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    const r = await callProcedure(plsql, binds);
    return { id: r.outBinds.p_id, ...data };
  }

  static async update(id, data) {
    const plsql = `
      BEGIN
        reportes_pkg.upd(
          :id,
          TO_DATE(:fecha, 'YYYY-MM-DD'),
          :usuario,
          :mascota,
          :provincia,
          :canton,
          :distrito,
          :detalles
        );
      END;`;
    const binds = {
      id,
      fecha: String(data.fecha),
      usuario: (data.usuario ?? null),
      mascota: (data.mascota ?? null),
      provincia: data.provincia,
      canton: data.canton,
      distrito: data.distrito,
      detalles: data.detalles
    };
    await callProcedure(plsql, binds);
    return { id, ...data };
  }

  static async findAll() {
    return await callFunctionCursor(
      `BEGIN :rc := reportes_pkg.list_all; END;`,
      {}
    );
  }

  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := reportes_pkg.get_by_id(:p_id); END;`,
      { p_id: id }
    );
    return rows[0] || null;
  }

  static async delete(id) {
    await callProcedure(`BEGIN reportes_pkg.del(:id); END;`, { id });
    return true;
  }
}

module.exports = Reporte;
