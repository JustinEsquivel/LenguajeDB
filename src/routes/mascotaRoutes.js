const express = require('express'); 

const router = express.Router(); 

const mascotaController = require('../controllers/mascotaController'); 

  

// GET all mascotas 

router.get('/mascotas', mascotaController.getAllMascotas); 

  

// GET mascota by id 

router.get('/mascotas/:id', mascotaController.getMascotaById); 

  

// POST search mascota by name 

router.post('/mascotas-search', mascotaController.searchMascotaByName); 

  

// POST create mascota 

router.post('/mascotas', mascotaController.createMascota); 

  

// PUT update mascota 

router.put('/mascotas/:id', mascotaController.updateMascota); 

  

// DELETE delete mascota 

router.delete('/mascotas/:id', mascotaController.deleteMascota); 

  

// GET mascotas by usuario 

router.get('/usuarios/:usuarioId/mascotas', mascotaController.getMascotasByUsuario); 

router.get('/mascotas-disponibles', mascotaController.getMascotasDisponibles); 

  

module.exports = router; 