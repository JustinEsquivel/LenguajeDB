const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asistenciaController');

// Registrar asistencia
router.post('/asistencias', ctrl.registrar);

// Eliminar por id
router.delete('/asistencias/:id', ctrl.eliminar);

// Eliminar por (evento, usuario)
router.delete('/eventos/:eventoId/asistencias/usuario/:usuarioId', ctrl.eliminarPorEventoUsuario);

// Listar asistentes de un evento
router.get('/eventos/:eventoId/asistencias', ctrl.listarPorEvento);

// ¿Usuario X está registrado en evento Y?
router.get('/eventos/:eventoId/asistencias/usuario/:usuarioId/existe', ctrl.existe);

module.exports = router;
