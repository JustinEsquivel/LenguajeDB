const Mascota = require('../models/mascota');

class MascotaService {
  async getAllMascotas()          { return await Mascota.findAll(); }
  async getMascotaById(id)        { return await Mascota.findById(id); }
  async searchMascotaByName(name) { return await Mascota.searchByName(name); }
  async createMascota(data)       { return await Mascota.create(data); }
  async updateMascota(id, data)   { return await Mascota.update(id, data); }
  async deleteMascota(id)         { return await Mascota.delete(id); }
  async getMascotasByUsuario(uid) { return await Mascota.findByUsuario(uid); }
  async getMascotasDisponibles(name='') { return await Mascota.findDisponibles(name); }
}
module.exports = new MascotaService();
