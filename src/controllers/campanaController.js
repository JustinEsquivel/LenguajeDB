const campanaService = require('../services/campanaService');

class CampanaController {
  // Obtener todas las campañas
  async getAllCampanas(req, res) {
    try {
      const campanas = await campanaService.getAllCampanas();
      res.status(200).json(campanas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Obtener campaña por ID
  async getCampanaById(req, res) {
    try {
      const campana = await campanaService.getCampanaById(req.params.id);
      if (campana) {
        res.status(200).json(campana);
      } else {
        res.status(404).json({ error: 'Campaña no encontrada' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Buscar campañas por nombre
  async searchCampanaByNombre(req, res) {
    try {
      const campanas = await campanaService.searchCampanaByNombre(req.body.search);
      res.status(200).json(campanas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Crear nueva campaña
  async createCampana(req, res) {
    try {
      const campana = await campanaService.createCampana(req.body);
      res.status(201).json(campana);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Actualizar campaña
  async updateCampana(req, res) {
    try {
      const campana = await campanaService.updateCampana(req.params.id, req.body);
      if (campana) {
        res.status(200).json(campana);
      } else {
        res.status(404).json({ error: 'Campaña no encontrada' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Eliminar campaña
  async deleteCampana(req, res) {
    try {
      const success = await campanaService.deleteCampana(req.params.id);
      if (success) {
        res.status(200).json({ message: 'Campaña eliminada correctamente' });
      } else {
        res.status(404).json({ error: 'Campaña no encontrada' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CampanaController();
