const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

class AuthService {
    // Registrar usuario
    async registerUser(userData) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await Usuario.findByEmail(userData.email);
            if (existingUser) {
                return { success: false, message: 'El email ya está registrado' };
            }

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;

            // Crear usuario
            const newUser = await Usuario.create(userData);

            if (newUser) {
                return { success: true, user: newUser };
            } else {
                return { success: false, message: 'Error al crear el usuario' };
            }
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

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) return null;

            // Retornar solo los campos necesarios
            return {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.rol
            };
        } catch (error) {
            console.error('Error en authenticateUser:', error);
            throw error;
        }
    }

    // Crear sesión de usuario
    createUserSession(req, user) {
        req.session.regenerate((err) => {
            if (err) {
                console.error('Error al regenerar sesión:', err);
                throw err;
            }

            req.session.user = {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.rol
            };

            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar sesión:', err);
                    throw err;
                }
            });
        });
    }

    // Destruir sesión
    destroyUserSession(req) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al destruir sesión:', err);
                throw err;
            }
        });
    }

    // Obtener usuario actual
    getCurrentUser(req) {
        return req.session.user || null;
    }
}

module.exports = new AuthService();