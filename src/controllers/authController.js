const { validationResult } = require('express-validator');
const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
      }

      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y password requeridos' });
      }

      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: error.message || 'Error en el servidor' });
    }
  }
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
      }

      const { nombre, apellido, email, password, telefono, rol } = req.body || {};
      if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ error: 'Campos obligatorios faltantes' });
      }

      const result = await authService.registerUser({ nombre, apellido, email, password, telefono, rol });
      if (!result.success) {
        return res.status(400).json({ error: result.message || 'Error al crear usuario' });
      }

      return res.status(201).json(result.user);
    } catch (error) {
      console.error('Error en registro:', error);
      return res.status(500).json({ error: error.message || 'Error en el servidor' });
    }
  }
  logout(req, res) {
    try {
      authService.destroyUserSession(req);
      return res.status(204).send();
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Error al cerrar sesión' });
    }
  }
}

module.exports = new AuthController();
