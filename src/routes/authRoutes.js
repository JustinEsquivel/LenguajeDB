const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');

// Rutas de autenticación
router.get('/register', authController.showRegistrationForm);
router.post('/register', [
    check('nombre').notEmpty().withMessage('El nombre es requerido'),
    check('apellido').notEmpty().withMessage('El apellido es requerido'),
    check('email').isEmail().withMessage('Email inválido'),
    check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], authController.register);

router.get('/login', authController.showLoginForm);
router.post('/login', [
    check('email').isEmail().withMessage('Email inválido'),
    check('password').notEmpty().withMessage('La contraseña es requerida')
], authController.login);

router.get('/logout', authController.logout);

module.exports = router;