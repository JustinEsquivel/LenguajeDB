const VA = require('../models/voluntarioActividad');

class VoluntarioActividadService {
  async add(voluntarioId, actividad)      { return await VA.add(voluntarioId, actividad); }
  async remove(voluntarioId, actividad)   { return await VA.remove(voluntarioId, actividad); }
  async removeAll(voluntarioId)           { return await VA.removeAll(voluntarioId); }
  async list(voluntarioId)                { return await VA.list(voluntarioId); }
  async count(voluntarioId)               { return await VA.count(voluntarioId); }
}
module.exports = new VoluntarioActividadService();
