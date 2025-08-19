const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

function toJsLocalDate(input) {
  if (input instanceof Date && !isNaN(input)) return input;

  if (typeof input === 'string') {
    const s = input.includes('T') ? input : `${input}T00:00`;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):?(\d{2})?$/);
    if (m) {
      const [ , Y, M, D, H, I = '00' ] = m;
      const y = parseInt(Y,10), mo = parseInt(M,10)-1, d = parseInt(D,10),
            h = parseInt(H,10), mi = parseInt(I,10);
      const dt = new Date(y, mo, d, h, mi, 0, 0);
      if (!isNaN(dt)) return dt;
    }
    const dt = new Date(input);
    if (!isNaN(dt)) return dt;
  }
  return null;
}

class Evento {
  static async create(data) {
    const jsDate = toJsLocalDate(data.fecha);
    if (!jsDate) throw new Error('Fecha inválida. Usa formato YYYY-MM-DDTHH:mm');

    const r = await callProcedure(
      `BEGIN eventos_pkg.ins(:nombre,:descripcion,:fecha,:ubicacion,:responsable,:tipo,:estado,:p_id); END;`,
      {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        fecha: { val: jsDate, type: oracledb.DATE },
        ubicacion: data.ubicacion || null,
        responsable: Number(data.responsable),
        tipo: data.tipo,
        estado: data.estado,
        p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { id: r.outBinds.p_id, ...data };
  }

  static async update(id, data) {
    const jsDate = toJsLocalDate(data.fecha);
    if (!jsDate) throw new Error('Fecha inválida. Usa formato YYYY-MM-DDTHH:mm');

    await callProcedure(
      `BEGIN eventos_pkg.upd(:id,:nombre,:descripcion,:fecha,:ubicacion,:responsable,:tipo,:estado); END;`,
      {
        id: Number(id),
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        fecha: { val: jsDate, type: oracledb.DATE },  
        ubicacion: data.ubicacion || null,
        responsable: Number(data.responsable),
        tipo: data.tipo,
        estado: data.estado
      }
    );
    return { id, ...data };
  }

  static async delete(id) {
    await callProcedure(`BEGIN eventos_pkg.del(:id); END;`, { id: Number(id) });
    return true;
  }

  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := eventos_pkg.get_by_id(:p_id); END;`,
      { p_id: Number(id) }
    );
    return rows[0] || null;
  }

  static async findAll() {
    return await callFunctionCursor(`BEGIN :rc := eventos_pkg.list_all; END;`);
  }

  static async countPorEstado(estado) {
    const r = await callProcedure(
      `BEGIN :out := eventos_pkg.count_por_estado(:p_estado); END;`,
      { out: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, p_estado: estado },
      { autoCommit: false }
    );
    return r.outBinds.out || 0;
  }
}

module.exports = Evento;
