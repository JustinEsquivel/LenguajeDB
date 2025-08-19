const express = require('express'); 

const router = express.Router(); 

const mascotaController = require('../controllers/mascotaController'); 

  
router.get('/mascotas', mascotaController.getAllMascotas); 
router.get('/mascotas/:id', mascotaController.getMascotaById); 
router.post('/mascotas-search', mascotaController.searchMascotaByName); 
router.post('/mascotas', mascotaController.createMascota); 
router.put('/mascotas/:id', mascotaController.updateMascota); 
router.delete('/mascotas/:id', mascotaController.deleteMascota); 

router.get('/usuarios/:usuarioId/mascotas', mascotaController.getMascotasByUsuario); 
router.get('/mascotas-disponibles', mascotaController.getMascotasDisponibles); 

  

module.exports = router; 