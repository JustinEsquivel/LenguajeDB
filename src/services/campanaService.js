const Campana = require('../models/campana');

function ciIncludes(haystack, needle) {
  if (!needle) return true;
  return String(haystack || '').toUpperCase().includes(String(needle).toUpperCase());
}

class CampanaService {
  async getCampanasActivas(nombre = null)  {
    const rows = await Campana.findActivas(); // paquete campanas_pkg.list_activas
    return nombre ? rows.filter(r => ciIncludes(r.NOMBRE ?? r.nombre, nombre)) : rows;
  }

  async getCampanasAll(nombre = null) {
    const rows = await Campana.findAll(); // paquete campanas_pkg.list_all
    return nombre ? rows.filter(r => ciIncludes(r.NOMBRE ?? r.nombre, nombre)) : rows;
  }

  async getCampanaById(id)             { return await Campana.findById(id); }
  async createCampana(data)            { return await Campana.create(data); }
  async updateCampana(id, data)        { return await Campana.update(id, data); }
  async deleteCampana(id)              { return await Campana.delete(id); }
  async getTotalRecaudado(campanaId)   { return await Campana.totalRecaudado(campanaId); }
}

module.exports = new CampanaService();
