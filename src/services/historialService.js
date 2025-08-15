const Historial = require('../models/historial');

class HistorialService {
  async create(data)                    { return await Historial.create(data); }
  async update(id, data)                { return await Historial.update(id, data); }
  async remove(id)                      { return await Historial.delete(id); }
  async getById(id)                     { return await Historial.findById(id); }
  async listByMascota(mascotaId)        { return await Historial.listByMascota(mascotaId); }
  async listActivosByMascota(mascotaId) { return await Historial.listActivosByMascota(mascotaId); }
}
module.exports = new HistorialService();
