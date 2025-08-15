const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// CRUD
router.get('/usuarios', usuarioController.getAllUsuarios);
router.get('/usuarios/:id', usuarioController.getUsuarioById);
router.post('/usuarios', usuarioController.createUsuario);
router.put('/usuarios/:id', usuarioController.updateUsuario);
router.delete('/usuarios/:id', usuarioController.deleteUsuario);

// métrica
router.get('/usuarios-count/:rol', usuarioController.countPorRol);

module.exports = router;
