const Reporte = require('../models/reporte');

class ReporteService {
  async listAll()          { return await Reporte.findAll(); }
  async getById(id)        { return await Reporte.findById(id); }
  async create(data)       { return await Reporte.create(data); }
  async update(id, data)   { return await Reporte.update(id, data); }
  async remove(id)         { return await Reporte.delete(id); }
}
module.exports = new ReporteService();
