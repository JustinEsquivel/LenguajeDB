const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/voluntarioActividadController');

router.get('/voluntarios/:voluntarioId/actividades', ctrl.list);
router.get('/voluntarios/:voluntarioId/actividades-count', ctrl.count);
router.post('/voluntarios/:voluntarioId/actividades', ctrl.add);
router.delete('/voluntarios/:voluntarioId/actividades/:actividad', ctrl.remove);

router.delete('/voluntarios/:voluntarioId/actividades', ctrl.removeAll);

module.exports = router;
