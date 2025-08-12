const Usuario = require('../models/usuario');

class UsuarioService {
  // Get all users
  async getAllUsers() {
    return await Usuario.findAll();
  }

  // Get user by id
  async getUserById(id) {
    return await Usuario.findById(id);
  }

  // Get user by email
  async getUserByEmail(email) {
    return await Usuario.findByEmail(email);
  }

  // Search users by name or last name
  async searchUserByNameOrLast(name) {
    return await Usuario.searchByNameOrLast(name);
  }

  // Create user
  async createUser(data) {
    return await Usuario.create(data);
  }

  // Update user
  async updateUser(id, user) {
    return await Usuario.update(id, user);
  }

  // Delete user
  async deleteUser(id) {
    return await Usuario.delete(id);
  }

  // Authenticate user
  async authenticateUser(email, password) {
    return await Usuario.authenticate(email, password);
  }
}

module.exports = new UsuarioService();