const Voluntario = require('../models/voluntario');

class VoluntarioService {
  async listAll()       { return await Voluntario.findAll(); }
  async listActivos()   { return await Voluntario.findActivos(); }
  async getById(id)     { return await Voluntario.findById(id); }
  async create(data)    { return await Voluntario.create(data); }
  async update(id,data) { return await Voluntario.update(id, data); }
  async remove(id)      { return await Voluntario.delete(id); }
}
module.exports = new VoluntarioService();
