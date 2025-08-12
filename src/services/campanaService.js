const Campana = require('../models/campana');

class CampanaService {
  // Obtener todas las campañas
  async getAllCampanas() {
    return await Campana.findAll();
  }

  // Obtener campaña por ID
  async getCampanaById(id) {
    return await Campana.findById(id);
  }

  // Buscar campañas por nombre (si aplica)
  async searchCampanaByNombre(nombre) {
    return await Campana.searchByNombre(nombre);
  }

  // Crear una nueva campaña
  async createCampana(data) {
    return await Campana.create(data);
  }

  // Actualizar una campaña
  async updateCampana(id, data) {
    return await Campana.update(id, data);
  }

  // Eliminar una campaña
  async deleteCampana(id) {
    return await Campana.delete(id);
  }
}

module.exports = new CampanaService();
