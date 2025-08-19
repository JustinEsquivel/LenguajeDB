
const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

function normalizeRow(row = {}) {
  const out = {};
  for (const k of Object.keys(row)) out[k.toLowerCase()] = row[k];
  return out;
}

class Usuario {
  static async create(data) {
    const plsql = `BEGIN usuarios_pkg.ins(:nombre,:apellido,:email,:password,:telefono,:rol,:p_id); END;`;
    const binds = {
      nombre:   data.nombre,
      apellido: data.apellido,
      email:    data.email,
      password: data.password,
      telefono: data.telefono,
      rol:      Number(data.rol), 
      p_id:     { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    const r = await callProcedure(plsql, binds);
    return { id: r.outBinds.p_id, ...data, rol: Number(data.rol) };
  }

  static async update(id, data) {
    const plsql = `BEGIN usuarios_pkg.upd(:id,:nombre,:apellido,:email,:password,:telefono,:rol); END;`;
    const binds = {
      id:       Number(id),
      nombre:   data.nombre,
      apellido: data.apellido,
      email:    data.email,
      password: data.password,
      telefono: data.telefono,
      rol:      Number(data.rol)
    };
    await callProcedure(plsql, binds);
    return { id: Number(id), ...data, rol: Number(data.rol) };
  }

  static async findByEmail(email) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := usuarios_pkg.get_by_email(:p_email); END;`,
      { p_email: email }
    );
    return rows[0] ? normalizeRow(rows[0]) : null;
  }

  static async delete(id) {
    await callProcedure(`BEGIN usuarios_pkg.del(:id); END;`, { id: Number(id) });
    return true;
  }

  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := usuarios_pkg.get_by_id(:p_id); END;`,
      { p_id: Number(id) }
    );
    return rows[0] ? normalizeRow(rows[0]) : null;
  }

  static async findAll() {
    const rows = await callFunctionCursor(`BEGIN :rc := usuarios_pkg.list_all; END;`);
    return rows.map(normalizeRow);
  }

  static async countByRol(rol) {
    const binds = {
      out:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_rol: Number(rol)
    };
    const r = await callProcedure(`BEGIN :out := usuarios_pkg.count_por_rol(:p_rol); END;`, binds, { autoCommit: false });
    return r.outBinds.out || 0;
  }
}

module.exports = Usuario;
