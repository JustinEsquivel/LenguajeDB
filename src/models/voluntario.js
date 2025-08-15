// backend/models/voluntario.js
const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');
const Usuario = require('./usuario');

// lee una propiedad tolerando mayúsculas/minúsculas
function pick(obj, key) {
  if (!obj) return undefined;
  const k = String(key);
  return obj[k] ?? obj[k.toUpperCase()] ?? obj[k.toLowerCase()];
}

// Normaliza cualquier valor a Date para Oracle DATE
function toOraDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string') {
    const s = v.trim();
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00` : s;
    const d = new Date(iso);
    if (!isNaN(d)) return d;
  }
  throw new Error('Fecha inválida: use formato YYYY-MM-DD');
}

// Asegura que el usuario existe y tiene rol=3 (o texto "Voluntario")
async function ensureUsuarioVoluntario(usuario) {
  const id = Number(usuario);
  if (!Number.isInteger(id)) throw new Error('usuario debe ser un ID numérico');

  const u = await Usuario.findById(id);
  if (!u) throw new Error(`Usuario ${id} no existe`);

  const rawRol = pick(u, 'rol');                // 3 o "Voluntario"
  const rolNum = Number(rawRol);
  const esVoluntario = (rolNum === 3) || (String(rawRol).toLowerCase() === 'voluntario');

  if (!esVoluntario) throw new Error(`El usuario ${id} no tiene rol Voluntario (rol=3)`);
  return id;
}

class Voluntario {
  // CREATE -> voluntarios_pkg.ins
  static async create(data) {
    const usuarioId = await ensureUsuarioVoluntario(data.usuario);
    const r = await callProcedure(
      `BEGIN voluntarios_pkg.ins(:usuario,:fecha_inicio,:horas,:estado,:p_id); END;`,
      {
        usuario:      usuarioId,                         // FK validada
        fecha_inicio: toOraDate(data.fechaInicio),       // JS Date -> Oracle DATE
        horas:        Number(data.horas ?? 0),
        estado:       data.estado || 'Activo',
        p_id:         { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { id: r.outBinds.p_id, ...data, usuario: usuarioId, estado: data.estado || 'Activo' };
  }
  static async findAll() {
    return await callFunctionCursor(
      `BEGIN :rc := voluntarios_pkg.list_all; END;`
    );
  }

  // UPDATE -> voluntarios_pkg.upd
  static async update(id, data) {
    const usuarioId = await ensureUsuarioVoluntario(data.usuario);
    await callProcedure(
      `BEGIN voluntarios_pkg.upd(:id,:usuario,:fecha_inicio,:fecha_fin,:horas,:estado); END;`,
      {
        id:           Number(id),
        usuario:      usuarioId,
        fecha_inicio: toOraDate(data.fechaInicio),
        fecha_fin:    toOraDate(data.fechaFin),
        horas:        Number(data.horas ?? 0),
        estado:       data.estado
      }
    );
    return { id: Number(id), ...data, usuario: usuarioId };
  }

  // DELETE -> voluntarios_pkg.del
  static async delete(id) {
    await callProcedure(`BEGIN voluntarios_pkg.del(:id); END;`, { id: Number(id) });
    return true;
  }

  // READ (by id)
  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := voluntarios_pkg.get_by_id(:p_id); END;`,
      { p_id: Number(id) }
    );
    return rows[0] || null;
  }

  // READ (activos)
  static async findActivos() {
    return await callFunctionCursor(`BEGIN :rc := voluntarios_pkg.list_activos; END;`);
  }
}

module.exports = Voluntario;
