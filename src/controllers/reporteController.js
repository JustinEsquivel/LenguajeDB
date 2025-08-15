const svc = require('../services/reporteService');

class ReporteController {
  async list(req, res)  { try { res.status(200).json(await svc.listAll()); } catch(e){ res.status(400).json({error:e.message}); } }
  async get(req, res)   { try {
      const r = await svc.getById(req.params.id);
      if(!r) return res.status(404).json({error:'Reporte no encontrado'});
      res.status(200).json(r);
    } catch(e){ res.status(400).json({error:e.message}); } }
  async create(req, res){ try { res.status(201).json(await svc.create(req.body)); } catch(e){ res.status(400).json({error:e.message}); } }
  async update(req, res){ try { res.status(200).json(await svc.update(req.params.id, req.body)); } catch(e){ res.status(400).json({error:e.message}); } }
  async remove(req, res){ try { await svc.remove(req.params.id); res.status(200).json({message:'Reporte eliminado'}); } catch(e){ res.status(400).json({error:e.message}); } }
}
module.exports = new ReporteController();
