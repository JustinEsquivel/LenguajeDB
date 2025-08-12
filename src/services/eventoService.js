const Evento = require('../models/evento');

class EventoService {
  // Obtener todos los eventos
  async getAllEventos() {
    return await Evento.findAll();
  }

  // Obtener evento por ID
  async getEventoById(id) {
    return await Evento.findById(id);
  }

  // Buscar eventos por nombre
  async searchEventoByNombre(nombre) {
    return await Evento.searchByNombre(nombre);
  }

  // Crear evento
  async createEvento(data) {
    return await Evento.create(data);
  }

  // Actualizar evento
  async updateEvento(id, evento) {
    return await Evento.update(id, evento);
  }

  // Eliminar evento
  async deleteEvento(id) {
    return await Evento.delete(id);
  }
}

module.exports = new EventoService();
