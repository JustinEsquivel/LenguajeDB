const oracledb = require('oracledb');
const { callProcedure, callFunctionCursor } = require('../config/db');

class Mascota {
  static async create(data) {
    const plsql = `
      BEGIN
        mascotas_pkg.ins(
          :nombre, :raza, :edad, :descripcion, :foto, :estado, :usuario, :p_id
        );
      END;`;
    const binds = {
      nombre: data.nombre,
      raza: data.raza,
      edad: data.edad,
      descripcion: data.descripcion,
      foto: data.foto || null,
      estado: data.estado || 'Disponible',
      usuario: data.usuario,
      p_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    const result = await callProcedure(plsql, binds);
    return { id: result.outBinds.p_id, ...data, estado: data.estado || 'Disponible' };
  }

  static async findDisponibles(name = '') {
    const rows = await callFunctionCursor(`BEGIN :rc := mascotas_pkg.list_disponibles; END;`);
    if (!name) return rows;
    const q = name.trim().toLowerCase();
    return rows.filter(r => (r.NOMBRE || r.nombre || '').toLowerCase().includes(q));
  }

  static async findById(id) {
    const rows = await callFunctionCursor(
      `BEGIN :rc := mascotas_pkg.get_by_id(:p_id); END;`,
      { p_id: id }
    );
    return rows[0] || null;
  }

  static async searchByName(name) {
    const rows = await callFunctionCursor(`BEGIN :rc := mascotas_pkg.list_disponibles; END;`);
    const q = (name || '').toLowerCase();
    return rows.filter(r => (r.NOMBRE || r.nombre || '').toLowerCase().includes(q));
  }

  static async update(id, data) {
    const plsql = `
      BEGIN
        mascotas_pkg.upd(
          :id, :nombre, :raza, :edad, :descripcion, :foto, :estado, :usuario
        );
      END;`;
    const binds = {
      id,
      nombre: data.nombre,
      raza: data.raza,
      edad: data.edad,
      descripcion: data.descripcion,
      foto: data.foto || null,
      estado: data.estado,
      usuario: data.usuario
    };
    await callProcedure(plsql, binds);
    return { id, ...data };
  }

  static async delete(id) {
    await callProcedure(`BEGIN mascotas_pkg.del(:id); END;`, { id });
    return true;
  }

  static async findByUsuario(usuarioId) {
    const rows = await callFunctionCursor(`BEGIN :rc := mascotas_pkg.list_disponibles; END;`);
    return rows.filter(r => String(r.USUARIO || r.usuario) === String(usuarioId));
  }

  static async findAll() {
    return await callFunctionCursor(`BEGIN :rc := mascotas_pkg.list_all; END;`);
  }
  static async searchByName(name) {
    return await callFunctionCursor(
      `BEGIN :rc := mascotas_pkg.list_all_by_name(:p_name); END;`,
      { p_name: name || '' }
    );
  }

}

module.exports = Mascota;
