const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

class Asistencia {
  // CREATE -> asistencias_pkg.ins
  static async create({ evento, usuario }) {
    const r = await callProcedure(
      `BEGIN asistencias_pkg.ins(:evento,:usuario,:p_id); END;`,
      {
        evento,
        usuario,
        p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { id: r.outBinds.p_id, evento, usuario };
  }

  // DELETE por id -> asistencias_pkg.del
  static async delete(id) {
    await callProcedure(`BEGIN asistencias_pkg.del(:id); END;`, { id });
    return true;
  }

  // DELETE por (evento, usuario) -> asistencias_pkg.del_por_usuario
  static async deleteByEventoUsuario(evento, usuario) {
    await callProcedure(
      `BEGIN asistencias_pkg.del_por_usuario(:evento,:usuario); END;`,
      { evento, usuario }
    );
    return true;
  }

  // LIST por evento (cursor) -> asistencias_pkg.list_por_evento
  static async listByEvento(evento) {
    return await callFunctionCursor(
      `BEGIN :rc := asistencias_pkg.list_por_evento(:evento); END;`,
      { evento }
    );
  }

  // Existe? (NUMBER 0/1) -> asistencias_pkg.existe
  static async exists(evento, usuario) {
    const r = await callProcedure(
      `BEGIN :out := asistencias_pkg.existe(:evento,:usuario); END;`,
      {
        out: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        evento,
        usuario
      },
      { autoCommit: false }
    );
    return Number(r.outBinds.out) > 0;
  }
}

module.exports = Asistencia;
