// src/services/authService.js
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

const SALT_ROUNDS = 10;

class AuthService {
  // Registrar usuario con hash
  async registerUser(userData) {
    try {
      const existingUser = await Usuario.findByEmail(userData.email);
      if (existingUser) {
        return { success: false, message: 'El email ya está registrado' };
      }

      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      userData.password = hashedPassword;

      const newUser = await Usuario.create(userData);
      if (!newUser) return { success: false, message: 'Error al crear el usuario' };

      // Nunca regresamos el hash
      const { password, PASSWORD, ...safe } = newUser;
      return { success: true, user: safe };
    } catch (error) {
      console.error('Error en registerUser:', error);
      throw error;
    }
  }

  // Autenticar usuario
  async authenticateUser(email, password) {
    try {
      const user = await Usuario.findByEmail(email);
      if (!user) return null;

      // Oracle puede traer MAYÚSCULAS
      const dbHash = user.PASSWORD ?? user.password ?? null;

      if (!dbHash) {
        // el usuario no tiene password almacenado
        return null;
      }

      let ok = false;
      if (typeof dbHash === 'string' && dbHash.startsWith('$2')) {
        // Bcrypt
        ok = await bcrypt.compare(password, dbHash);
      } else {
        // Datos viejos en texto plano
        ok = String(password) === String(dbHash);
      }

      if (!ok) return null;

      // Armar objeto seguro (sin password)
      const safeUser = {
        id:       user.ID ?? user.id,
        email:    user.EMAIL ?? user.email,
        nombre:   user.NOMBRE ?? user.nombre,
        apellido: user.APELLIDO ?? user.apellido,
        rol:      user.ROL ?? user.rol
      };
      return safeUser;
    } catch (error) {
      console.error('Error en authenticateUser:', error);
      throw error;
    }
  }

  // (opcional) sesiones con express-session
  createUserSession(req, user) {
    req.session.regenerate((err) => {
      if (err) { console.error('Error al regenerar sesión:', err); throw err; }
      req.session.user = {
        id: user.id, email: user.email, nombre: user.nombre, apellido: user.apellido, rol: user.rol
      };
      req.session.save((err) => {
        if (err) { console.error('Error al guardar sesión:', err); throw err; }
      });
    });
  }

  destroyUserSession(req) {
    req.session.destroy((err) => {
      if (err) { console.error('Error al destruir sesión:', err); throw err; }
    });
  }

  getCurrentUser(req) {
    return req.session.user || null;
  }
}

module.exports = new AuthService();
