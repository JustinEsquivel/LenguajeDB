const svc = require('../services/voluntarioActividadService');

class VoluntarioActividadController {
  async add(req, res) {
    try {
      const voluntarioId = Number(req.params.voluntarioId);
      const { actividad } = req.body;
      if (!actividad) return res.status(400).json({ error: 'actividad es requerida' });
      const data = await svc.add(voluntarioId, actividad);
      res.status(201).json(data);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async remove(req, res) {
    try {
      const voluntarioId = Number(req.params.voluntarioId);
      const actividad = decodeURIComponent(req.params.actividad);
      await svc.remove(voluntarioId, actividad);
      res.status(200).json({ message: 'Actividad eliminada' });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async removeAll(req, res) {
    try {
      const voluntarioId = Number(req.params.voluntarioId);
      await svc.removeAll(voluntarioId);
      res.status(200).json({ message: 'Actividades eliminadas' });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async list(req, res) {
    try {
      const voluntarioId = Number(req.params.voluntarioId);
      res.status(200).json(await svc.list(voluntarioId));
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async count(req, res) {
    try {
      const voluntarioId = Number(req.params.voluntarioId);
      res.status(200).json({ voluntarioId, total: await svc.count(voluntarioId) });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
}
module.exports = new VoluntarioActividadController();
