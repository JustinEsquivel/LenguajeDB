const Adopcion = require('../models/adopcion');

class AdopcionService {
  async listAll()                  { return await Adopcion.findAll(); }
  async getById(id)                { return await Adopcion.findById(id); }
  async create(data)               { return await Adopcion.create(data); }
  async remove(id)                 { return await Adopcion.delete(id); }
  async updateFecha(id, fecha)     { return await Adopcion.updateFecha(id, fecha); }
}

module.exports = new AdopcionService();
