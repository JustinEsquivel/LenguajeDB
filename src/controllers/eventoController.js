const eventoService = require('../services/eventoService');

class EventoController {
  // Obtener todos los eventos
  async getAllEventos(req, res) {
    try {
      const eventos = await eventoService.getAllEventos();
      res.status(200).json(eventos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Obtener evento por ID
  async getEventoById(req, res) {
    try {
      const evento = await eventoService.getEventoById(req.params.id);
      if (evento) {
        res.status(200).json(evento);
      } else {
        res.status(404).json({ error: 'Evento no encontrado' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Buscar eventos por nombre
  async searchEventoByNombre(req, res) {
    try {
      const eventos = await eventoService.searchEventoByNombre(req.body.search);
      res.status(200).json(eventos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Crear un nuevo evento
  async createEvento(req, res) {
    try {
      const evento = await eventoService.createEvento(req.body);
      res.status(201).json(evento);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Actualizar un evento
  async updateEvento(req, res) {
    try {
      const evento = await eventoService.updateEvento(req.params.id, req.body);
      if (evento) {
        res.status(200).json(evento);
      } else {
        res.status(404).json({ error: 'Evento no encontrado' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Eliminar un evento
  async deleteEvento(req, res) {
    try {
      const success = await eventoService.deleteEvento(req.params.id);
      if (success) {
        res.status(200).json({ message: 'Evento eliminado correctamente' });
      } else {
        res.status(404).json({ error: 'Evento no encontrado' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new EventoController();
