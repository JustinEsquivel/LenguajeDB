const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/voluntarioActividadController');

// Listar actividades de un voluntario
router.get('/voluntarios/:voluntarioId/actividades', ctrl.list);

// Contar actividades
router.get('/voluntarios/:voluntarioId/actividades-count', ctrl.count);

// Agregar actividad
router.post('/voluntarios/:voluntarioId/actividades', ctrl.add);

// Eliminar actividad puntual (actividad URL-encoded en el path)
router.delete('/voluntarios/:voluntarioId/actividades/:actividad', ctrl.remove);

// Eliminar todas las actividades del voluntario
router.delete('/voluntarios/:voluntarioId/actividades', ctrl.removeAll);

module.exports = router;
