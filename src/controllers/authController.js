const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
    // Mostrar formulario de registro
    showRegistrationForm(req, res) {
        res.render('auth/register', {
            successMessage: req.flash('success'),
            errorMessage: req.flash('error'),
            formData: req.flash('formData')[0] || {}
        });
    }

    // Procesar registro
    async register(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array());
            req.flash('formData', req.body);
            return res.redirect('/auth/register');
        }

        try {
            const result = await authService.registerUser(req.body);

            if (result.success) {
                req.flash('success', 'Registro exitoso. Por favor inicie sesión.');
                return res.redirect('/auth/login');
            } else {
                req.flash('error', result.message || 'Error en el registro');
                req.flash('formData', req.body);
                return res.redirect('/auth/register');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            req.flash('error', 'Error interno del servidor');
            req.flash('formData', req.body);
            return res.redirect('/auth/register');
        }
    }

    // Mostrar formulario de login
    showLoginForm(req, res) {
        res.render('auth/login', {
            errorMessage: req.flash('error'),
            email: req.flash('email')[0] || ''
        });
    }

    // Procesar login
    async login(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('error', errors.array());
            req.flash('email', req.body.email);
            return res.redirect('/auth/login');
        }

        try {
            const { email, password } = req.body;
            const user = await authService.authenticateUser(email, password);

            if (user) {
                // En aplicaciones con sesiones (como Express con passport), normalmente no se hace esto,
                // pero si estás usando fetch desde el frontend, responde el user directamente:
                return res.status(200).json(user);
            } else {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
        } catch (error) {
            console.error('Error en login:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
    }

    // Cerrar sesión
    logout(req, res) {
        authService.destroyUserSession(req);
        res.redirect('/');
    }

    // Middleware para verificar autenticación
    ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error', 'Por favor inicie sesión para continuar');
        res.redirect('/auth/login');
    }

    // Middleware para verificar roles
    checkRole(role) {
        return (req, res, next) => {
            if (req.user && req.user.rol === role) {
                return next();
            }
            req.flash('error', 'No autorizado');
            res.redirect('/');
        };
    }
}

module.exports = new AuthController();