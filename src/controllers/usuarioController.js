const usuarioService = require('../services/usuarioService');

class UsuarioController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await usuarioService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get user by id
  async getUserById(req, res) {
    try {
      const user = await usuarioService.getUserById(req.params.id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get user by email
  async getUserByEmail(req, res) {
    try {
      const user = await usuarioService.getUserByEmail(req.params.email);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Search users by name
  async searchUserByName(req, res) {
    try {
      const users = await usuarioService.searchUserByNameOrLast(req.body.search);
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Create user
  async createUser(req, res) {
    try {
      const user = await usuarioService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const user = await usuarioService.updateUser(req.params.id, req.body);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const success = await usuarioService.deleteUser(req.params.id);
      if (success) {
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Authenticate user
  async authenticateUser(req, res) {
    try {
      const user = await usuarioService.authenticateUser(req.body.email, req.body.password);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UsuarioController();