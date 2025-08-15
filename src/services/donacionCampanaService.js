const DonacionCampana = require('../models/donacionCampana');

class DonacionCampanaService {
  async getById(id)                     { return await DonacionCampana.findById(id); }
  async listByCampana(campanaId)        { return await DonacionCampana.findByCampana(campanaId); }
  async createDonacion(data)            { return await DonacionCampana.create(data); }
  async updateDonacion(id, data)        { return await DonacionCampana.update(id, data); }
  async deleteDonacion(id)              { return await DonacionCampana.delete(id); }
  async totalByCampana(campanaId)       { return await DonacionCampana.totalByCampana(campanaId); }
}
module.exports = new DonacionCampanaService();
