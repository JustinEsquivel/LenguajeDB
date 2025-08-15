// src/controllers/mascotaController.js
const mascotaService = require('../services/mascotaService');

class MascotaController {
  // GET /api/mascotas
  async getAllMascotas(req, res) {
    try {
      const role = Number(req.headers['x-role'] || req.query.role || 0); // 1=admin
      const scope = (req.query.scope || '').toLowerCase();              // opcional: ?scope=all

      let mascotas;
      if (role === 1 || scope === 'all') {
        mascotas = await mascotaService.getAllMascotas();               // 🔥 todas
      } else {
        mascotas = await mascotaService.getMascotasDisponibles();       // solo disponibles
      }
      return res.status(200).json(mascotas);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }
  }

  // GET /api/mascotas/:id
  async getMascotaById(req, res) {
    try {
      const mascota = await mascotaService.getMascotaById(req.params.id);
      if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });
      return res.status(200).json(mascota);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // POST /api/mascotas-search  {search}
  async searchMascotaByName(req, res) {
    try {
      const role = Number(req.headers['x-role'] || req.query.role || 0);
      const term = req.body?.search || '';

      // Si es admin, busca en TODAS; si no, en disponibles
      if (role === 1) {
        const mascotas = await mascotaService.searchMascotaByName(term); // usa list_all_by_name
        return res.status(200).json(mascotas);
      } else {
        // filtra disponibles por nombre
        const disponibles = await mascotaService.getMascotasDisponibles('');
        const q = term.toLowerCase();
        const filtradas = disponibles.filter(m => (m.NOMBRE || m.nombre || '').toLowerCase().includes(q));
        return res.status(200).json(filtradas);
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async createMascota(req, res) {
    try {
      const mascota = await mascotaService.createMascota(req.body);
      return res.status(201).json(mascota);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateMascota(req, res) {
    try {
      const mascota = await mascotaService.updateMascota(req.params.id, req.body);
      if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });
      return res.status(200).json(mascota);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteMascota(req, res) {
    try {
      const ok = await mascotaService.deleteMascota(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Mascota no encontrada' });
      return res.status(200).json({ message: 'Mascota eliminada correctamente' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getMascotasByUsuario(req, res) {
    try {
      const mascotas = await mascotaService.getMascotasByUsuario(req.params.usuarioId);
      return res.status(200).json(mascotas);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // GET /api/mascotas-disponibles?NOMBRE=...
  async getMascotasDisponibles(req, res) {
    try {
      const name = req.query.NOMBRE || '';
      const mascotas = await mascotaService.getMascotasDisponibles(name);
      return res.status(200).json(mascotas);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new MascotaController();
