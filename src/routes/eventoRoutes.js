const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');

// Obtener todos los eventos
router.get('/', eventoController.getAllEventos);

// Obtener evento por ID
router.get('/:id', eventoController.getEventoById);

// Buscar eventos por título
router.get('/search/:nombre', eventoController.searchEventoByNombre);

// Crear un nuevo evento
router.post('/', eventoController.createEvento);

// Actualizar un evento existente
router.put('/:id', eventoController.updateEvento);

// Eliminar un evento
router.delete('/:id', eventoController.deleteEvento);

module.exports = router;
