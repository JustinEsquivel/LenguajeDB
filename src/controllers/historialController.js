const svc = require('../services/historialService');

class HistorialController {
  async create(req, res) {
    try { res.status(201).json(await svc.create(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async update(req, res) {
    try { res.status(200).json(await svc.update(Number(req.params.id), req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async remove(req, res) {
    try { await svc.remove(Number(req.params.id)); res.status(200).json({ message: 'Registro eliminado' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async getById(req, res) {
    try {
      const h = await svc.getById(Number(req.params.id));
      if (!h) return res.status(404).json({ error: 'Registro no encontrado' });
      res.status(200).json(h);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async listByMascota(req, res) {
    try { res.status(200).json(await svc.listByMascota(Number(req.params.mascotaId))); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async listActivosByMascota(req, res) {
    try { res.status(200).json(await svc.listActivosByMascota(Number(req.params.mascotaId))); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = new HistorialController();
