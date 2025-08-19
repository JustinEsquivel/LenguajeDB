const eventoService = require('../services/eventoService');

class EventoController {
  async getAll(req, res) {
    try { res.status(200).json(await eventoService.getAllEventos()); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async getById(req, res) {
    try {
      const ev = await eventoService.getEventoById(req.params.id);
      if (!ev) return res.status(404).json({ error: 'Evento no encontrado' });
      res.status(200).json(ev);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
  async create(req, res) {
    try {
      if (!req.body?.fecha) return res.status(400).json({ error: 'La fecha es requerida' });
      const ev = await eventoService.createEvento(req.body);
      res.status(201).json(ev);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
  async update(req, res) {
    try {
      if (!req.body?.fecha) return res.status(400).json({ error: 'La fecha es requerida' });
      const ev = await eventoService.updateEvento(req.params.id, req.body);
      res.status(200).json(ev);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
  async remove(req, res) {
    try { await eventoService.deleteEvento(req.params.id); res.status(200).json({ message: 'Evento eliminado' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async countByState(req, res) {
    try { res.status(200).json({ estado: req.params.estado, total: await eventoService.countEventosPorEstado(req.params.estado) }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async getPublic(req, res) {
    try {
      const { NOMBRE = '' } = req.query;
      const all = await eventoService.getAllEventos();
      const nombre = String(NOMBRE).toLowerCase().trim();

      const list = (Array.isArray(all) ? all : []).filter(e => {
        const est = (e.estado || '').toLowerCase();
        const okEstado = est === 'planificado' || est === 'en curso';
        const okNombre = !nombre || (String(e.nombre || '').toLowerCase().includes(nombre));
        return okEstado && okNombre;
      });
      res.status(200).json(list);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
}
module.exports = new EventoController();
