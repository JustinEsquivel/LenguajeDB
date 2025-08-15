const svc = require('../services/donacionCampanaService');

class DonacionCampanaController {
  async getById(req, res) {
    try {
      const d = await svc.getById(req.params.id);
      if (!d) return res.status(404).json({ error: 'Donación no encontrada' });
      res.status(200).json(d);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
  async listByCampana(req, res) {
    try { res.status(200).json(await svc.listByCampana(req.params.campanaId)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async create(req, res) {
    try { res.status(201).json(await svc.createDonacion(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async update(req, res) {
    try { res.status(200).json(await svc.updateDonacion(req.params.id, req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async remove(req, res) {
    try { await svc.deleteDonacion(req.params.id); res.status(200).json({ message: 'Donación eliminada' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async total(req, res) {
    try { res.status(200).json({ campanaId: Number(req.params.campanaId), total: await svc.totalByCampana(req.params.campanaId) }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
}
module.exports = new DonacionCampanaController();
