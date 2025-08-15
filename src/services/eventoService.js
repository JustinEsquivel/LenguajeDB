const Evento = require('../models/evento');

class EventoService {
  async getAllEventos()                  { return await Evento.findAll(); }
  async getEventoById(id)                { return await Evento.findById(id); }
  async createEvento(data)               { return await Evento.create(data); }
  async updateEvento(id, data)           { return await Evento.update(id, data); }
  async deleteEvento(id)                 { return await Evento.delete(id); }
  async countEventosPorEstado(estado)    { return await Evento.countPorEstado(estado); }
}

module.exports = new EventoService();
