const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

function asOraDate(v) {
  if (!v) return null;                      
  if (v instanceof Date) return v;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
  const d = new Date(s);                    
  if (isNaN(d)) throw new Error('Fecha inválida');
  return d;
}

class Historial {
  static async create(data) {
    const fecha = asOraDate(data.fecha); 
    const r = await callProcedure(
      `BEGIN historial_pkg.ins(
        :mascota,:fecha,:diagnostico,:tratamiento,:veterinario,:observaciones,:estado,:p_id
      ); END;`,
      {
        mascota: data.mascota,
        fecha: { val: fecha, type: oracledb.DB_TYPE_DATE },     
        diagnostico: data.diagnostico,
        tratamiento: data.tratamiento,
        veterinario: data.veterinario,
        observaciones: data.observaciones || null,
        estado: data.estado || 'Activo',
        p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { id: r.outBinds.p_id, ...data, fecha, estado: data.estado || 'Activo' };
  }

  static async update(id, data) {
    const fecha = asOraDate(data.fecha);
    await callProcedure(
      `BEGIN historial_pkg.upd(
        :id,:mascota,:fecha,:diagnostico,:tratamiento,:veterinario,:observaciones,:estado
      ); END;`,
      {
        id,
        mascota: data.mascota,
        fecha: { val: fecha, type: oracledb.DB_TYPE_DATE },     
        diagnostico: data.diagnostico,
        tratamiento: data.tratamiento,
        veterinario: data.veterinario,
        observaciones: data.observaciones || null,
        estado: data.estado
      }
    );
    return { id, ...data, fecha };
  }

  static async delete(id) {
    await callProcedure(`BEGIN historial_pkg.del(:id); END;`, { id });
    return true;
  }

  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := historial_pkg.get_by_id(:p_id); END;`,
      { p_id: id }
    );
    return rows[0] || null;
  }

  static async listByMascota(mascotaId) {
    return await callFunctionCursor(
      `BEGIN :rc := historial_pkg.list_por_mascota(:p_mascota); END;`,
      { p_mascota: mascotaId }
    );
  }

  static async listActivosByMascota(mascotaId) {
    return await callFunctionCursor(
      `BEGIN :rc := historial_pkg.list_activo_por_mascota(:p_mascota); END;`,
      { p_mascota: mascotaId }
    );
  }
}

module.exports = Historial;
