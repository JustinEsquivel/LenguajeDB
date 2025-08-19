const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');
const toDateOrNull = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y,m,d] = v.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
  }
  const d = new Date(v);             
  if (Number.isNaN(d.getTime())) return null; 
  return d;
};
class Inventario {
  static async create(data) {
    const r = await callProcedure(
      `BEGIN inventario_pkg.ins(:nombre,:tipo,:cantidad,:fecha_ing,:fecha_cad,:proveedor,:fuente,:p_id); END;`,
      {
        nombre:   data.nombre,
        tipo:     data.tipo,
        cantidad: Number(data.cantidad),
        fecha_ing:{ val: toDateOrNull(data.fechaIngreso),    type: oracledb.DATE },
        fecha_cad:{ val: toDateOrNull(data.fechaCaducidad),  type: oracledb.DATE },
        proveedor:data.proveedor,
        fuente:   data.fuente,
        p_id:     { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { id: r.outBinds.p_id, ...data };
  }

  static async update(id, data) {
    await callProcedure(
      `BEGIN inventario_pkg.upd(:id,:nombre,:tipo,:cantidad,:fecha_ing,:fecha_cad,:proveedor,:fuente); END;`,
      {
        id,
        nombre:   data.nombre,
        tipo:     data.tipo,
        cantidad: Number(data.cantidad),
        fecha_ing:{ val: toDateOrNull(data.fechaIngreso),    type: oracledb.DATE },
        fecha_cad:{ val: toDateOrNull(data.fechaCaducidad),  type: oracledb.DATE },
        proveedor:data.proveedor,
        fuente:   data.fuente
      }
    );
    return { id, ...data };
  }

  static async delete(id) {
    await callProcedure(`BEGIN inventario_pkg.del(:id); END;`, { id });
    return true;
  }

  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := inventario_pkg.get_by_id(:p_id); END;`,
      { p_id: id }
    );
    return rows[0] || null;
  }

  static async findAll() {
    return await callFunctionCursor(`BEGIN :rc := inventario_pkg.list_all; END;`);
  }
}

module.exports = Inventario;
