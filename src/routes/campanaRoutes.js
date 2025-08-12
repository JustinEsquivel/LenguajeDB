const express = require('express');
const router = express.Router();
const campanaController = require('../controllers/campanaController');

// Obtener todas las campañas
router.get('/', campanaController.getAllCampanas);

// Obtener campaña por ID
router.get('/:id', campanaController.getCampanaById);

// Buscar campañas por nombre (POST)
router.post('/search', campanaController.searchCampanaByNombre);

// Crear una nueva campaña
router.post('/', campanaController.createCampana);

// Actualizar una campaña
router.put('/:id', campanaController.updateCampana);

// Eliminar una campaña
router.delete('/:id', campanaController.deleteCampana);

module.exports = router;
