const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');

router.get('/eventos', eventoController.getAll);
router.get('/eventos/:id', eventoController.getById);
router.post('/eventos', eventoController.create);
router.put('/eventos/:id', eventoController.update);
router.delete('/eventos/:id', eventoController.remove);
router.get('/eventos-publicos', eventoController.getPublic);
// métrica
router.get('/eventos-count/:estado', eventoController.countByState);

module.exports = router;
