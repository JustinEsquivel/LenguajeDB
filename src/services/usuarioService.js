const Usuario = require('../models/usuario');

class UsuarioService {
  async getAllUsuarios()            { return await Usuario.findAll(); }
  async getUsuarioById(id)          { return await Usuario.findById(id); }
  async createUsuario(data)         { return await Usuario.create(data); }
  async updateUsuario(id, data)     { return await Usuario.update(id, data); }
  async deleteUsuario(id)           { return await Usuario.delete(id); }
  async countUsuariosPorRol(rol)    { return await Usuario.countByRol(rol); }
}

module.exports = new UsuarioService();
