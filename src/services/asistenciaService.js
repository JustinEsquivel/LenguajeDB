const Asistencia = require('../models/asistencia');

class AsistenciaService {
  async registrar(data)                     { return await Asistencia.create(data); }
  async eliminar(id)                        { return await Asistencia.delete(id); }
  async eliminarPorEventoUsuario(e, u)      { return await Asistencia.deleteByEventoUsuario(e, u); }
  async listarPorEvento(evento)             { return await Asistencia.listByEvento(evento); }
  async existe(evento, usuario)             { return await Asistencia.exists(evento, usuario); }
}

module.exports = new AsistenciaService();
