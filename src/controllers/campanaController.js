// controllers/campanaController.js
const campanaService = require('../services/campanaService');

class CampanaController {
  async listActivas(req, res) {
    try {
      const nombre = req.query.NOMBRE || req.query.nombre || null;
      const rows = await campanaService.getCampanasActivas(nombre);
      res.status(200).json(rows);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async listAll(req, res) {
    try {
      const nombre = req.query.NOMBRE || req.query.nombre || null;
      const rows = await campanaService.getCampanasAll(nombre);
      res.status(200).json(rows);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async getById(req, res) {
    try {
      const c = await campanaService.getCampanaById(req.params.id);
      if (!c) return res.status(404).json({ error: 'Campaña no encontrada' });
      res.status(200).json(c);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async create(req, res) {
    try { res.status(201).json(await campanaService.createCampana(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async update(req, res) {
    try { res.status(200).json(await campanaService.updateCampana(req.params.id, req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async delete(req, res) {
    try { await campanaService.deleteCampana(req.params.id); res.status(200).json({ message: 'Campaña eliminada' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async total(req, res) {
    try { res.status(200).json({ campanaId: Number(req.params.id), total: await campanaService.getTotalRecaudado(req.params.id) }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = new CampanaController();
