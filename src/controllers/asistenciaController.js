const svc = require('../services/asistenciaService');

class AsistenciaController {
  async registrar(req, res) {
    try {
      const { evento, usuario } = req.body;
      if (!evento || !usuario) return res.status(400).json({ error: 'evento y usuario son requeridos' });
      const created = await svc.registrar({ evento: Number(evento), usuario: Number(usuario) });
      res.status(201).json(created);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async eliminar(req, res) {
    try { await svc.eliminar(Number(req.params.id)); res.status(200).json({ message: 'Asistencia eliminada' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async eliminarPorEventoUsuario(req, res) {
    try {
      const evento = Number(req.params.eventoId);
      const usuario = Number(req.params.usuarioId);
      await svc.eliminarPorEventoUsuario(evento, usuario);
      res.status(200).json({ message: 'Asistencia eliminada' });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async listarPorEvento(req, res) {
    try { res.status(200).json(await svc.listarPorEvento(Number(req.params.eventoId))); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async existe(req, res) {
    try {
      const evento = Number(req.params.eventoId);
      const usuario = Number(req.params.usuarioId);
      const exists = await svc.existe(evento, usuario);
      res.status(200).json({ evento, usuario, exists });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
}
module.exports = new AsistenciaController();
