const Mascota = require('../models/mascota');



class MascotaService {

  // Get all mascotas 

  async getAllMascotas() {

    return await Mascota.findAll();

  }



  // Get mascota by id 

  async getMascotaById(id) {

    return await Mascota.findById(id);

  }



  // Search mascotas by name 

  async searchMascotaByName(name) {

    return await Mascota.searchByName(name);

  }



  // Create mascota 

  async createMascota(data) {

    return await Mascota.create(data);

  }



  // Update mascota 

  async updateMascota(id, mascota) {

    return await Mascota.update(id, mascota);

  }



  // Delete mascota 

  async deleteMascota(id) {

    return await Mascota.delete(id);

  }



  // Get mascotas by usuario 

  async getMascotasByUsuario(usuarioId) {

    return await Mascota.findByUsuario(usuarioId);

  }
  // Agregar este método a la clase MascotaService 

  async getMascotasDisponibles() {

    return await Mascota.findDisponibles();

  }

}



module.exports = new MascotaService(); 