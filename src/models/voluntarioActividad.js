const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

class VoluntarioActividad {
  static async add(voluntarioId, actividad) {
    await callProcedure(
      `BEGIN voluntarios_act_pkg.add_actividad(:v,:a); END;`,
      { v: voluntarioId, a: actividad }
    );
    return { voluntarioId, actividad };
  }

  static async remove(voluntarioId, actividad) {
    await callProcedure(
      `BEGIN voluntarios_act_pkg.del_actividad(:v,:a); END;`,
      { v: voluntarioId, a: actividad }
    );
    return true;
  }

  static async removeAll(voluntarioId) {
    await callProcedure(
      `BEGIN voluntarios_act_pkg.del_todas(:v); END;`,
      { v: voluntarioId }
    );
    return true;
  }

  static async list(voluntarioId) {
    return await callFunctionCursor(
      `BEGIN :rc := voluntarios_act_pkg.list_por_voluntario(:v); END;`,
      { v: voluntarioId }
    );
  }

  static async count(voluntarioId) {
    const r = await callProcedure(
      `BEGIN :out := voluntarios_act_pkg.count_actividades(:v); END;`,
      { out: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, v: voluntarioId },
      { autoCommit: false }
    );
    return r.outBinds.out || 0;
  }
}

module.exports = VoluntarioActividad;
