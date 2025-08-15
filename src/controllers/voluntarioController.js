const svc = require('../services/voluntarioService');

class VoluntarioController {
  async listAll(req, res)     { try { res.status(200).json(await svc.listAll()); }
                                catch(e){ res.status(400).json({error:e.message}); } }

  async listActivos(req, res) { try { res.status(200).json(await svc.listActivos()); }
                                catch(e){ res.status(400).json({error:e.message}); } }

  async get(req, res)         { try {
      const v = await svc.getById(req.params.id);
      if (!v) return res.status(404).json({ error:'Voluntario no encontrado' });
      res.status(200).json(v);
    } catch(e){ res.status(400).json({error:e.message}); } }

  async create(req, res)      { try { res.status(201).json(await svc.create(req.body)); }
                                catch(e){ res.status(400).json({error:e.message}); } }

  async update(req, res)      { try { res.status(200).json(await svc.update(req.params.id, req.body)); }
                                catch(e){ res.status(400).json({error:e.message}); } }

  async remove(req, res)      { try { await svc.remove(req.params.id); res.status(200).json({message:'Voluntario eliminado'}); }
                                catch(e){ res.status(400).json({error:e.message}); } }
}
module.exports = new VoluntarioController();
