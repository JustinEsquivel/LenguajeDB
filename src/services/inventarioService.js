const Inventario = require('../models/inventario');

class InventarioService {
  async getAll()                 { return await Inventario.findAll(); }
  async getById(id)              { return await Inventario.findById(id); }
  async create(data)             { return await Inventario.create(data); }
  async update(id, data)         { return await Inventario.update(id, data); }
  async remove(id)               { return await Inventario.delete(id); }
}

module.exports = new InventarioService();
