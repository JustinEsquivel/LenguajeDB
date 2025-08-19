const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asistenciaController');

router.post('/asistencias', ctrl.registrar);
router.delete('/asistencias/:id', ctrl.eliminar);
router.delete('/eventos/:eventoId/asistencias/usuario/:usuarioId', ctrl.eliminarPorEventoUsuario);
router.get('/eventos/:eventoId/asistencias', ctrl.listarPorEvento);
router.get('/eventos/:eventoId/asistencias/usuario/:usuarioId/existe', ctrl.existe);

module.exports = router;
