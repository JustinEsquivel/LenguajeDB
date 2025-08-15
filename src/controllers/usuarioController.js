const usuarioService = require('../services/usuarioService');

class UsuarioController {
  async getAllUsuarios(req, res) {
    try { res.status(200).json(await usuarioService.getAllUsuarios()); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async getUsuarioById(req, res) {
    try {
      const u = await usuarioService.getUsuarioById(req.params.id);
      if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.status(200).json(u);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async createUsuario(req, res) {
    try { res.status(201).json(await usuarioService.createUsuario(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async updateUsuario(req, res) {
    try { res.status(200).json(await usuarioService.updateUsuario(req.params.id, req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async deleteUsuario(req, res) {
    try { await usuarioService.deleteUsuario(req.params.id); res.status(200).json({ message: 'Usuario eliminado' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  async countPorRol(req, res) {
    try {
      const total = await usuarioService.countUsuariosPorRol(Number(req.params.rol));
      res.status(200).json({ rol: Number(req.params.rol), total });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = new UsuarioController();
