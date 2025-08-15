const svc = require('../services/adopcionService');

class AdopcionController {
  async list(req, res)  { try { res.status(200).json(await svc.listAll()); } catch (e) { res.status(400).json({ error: e.message }); } }
  async get(req, res)   { try {
      const a = await svc.getById(req.params.id);
      if (!a) return res.status(404).json({ error: 'Adopción no encontrada' });
      res.status(200).json(a);
    } catch (e) { res.status(400).json({ error: e.message }); } }
  async create(req, res){ try { res.status(201).json(await svc.create(req.body)); } catch (e) { res.status(400).json({ error: e.message }); } }
  async remove(req, res){ try { await svc.remove(req.params.id); res.status(200).json({ message: 'Adopción revertida' }); } catch (e) { res.status(400).json({ error: e.message }); } }
  async updFecha(req, res) {
    try { res.status(200).json(await svc.updateFecha(req.params.id, req.body.fecha)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = new AdopcionController();
