// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoints API (JSON)
router.post('/login', (req, res) => authController.login(req, res));
// Si quieres registrar desde aquí:
router.post('/register', (req, res) => authController.register(req, res));



module.exports = router;
