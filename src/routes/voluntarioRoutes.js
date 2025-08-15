const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/voluntarioController');

// NUEVO: lista todos
router.get('/voluntarios', ctrl.listAll);

// Ya existentes
router.get('/voluntarios/activos', ctrl.listActivos);
router.get('/voluntarios/:id', ctrl.get);
router.post('/voluntarios', ctrl.create);
router.put('/voluntarios/:id', ctrl.update);
router.delete('/voluntarios/:id', ctrl.remove);

module.exports = router;
