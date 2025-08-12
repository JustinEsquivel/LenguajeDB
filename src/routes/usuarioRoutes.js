const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// GET all users
router.get('/users', usuarioController.getAllUsers);

// GET user by id
router.get('/users-id/:id', usuarioController.getUserById);

// GET user by email
router.get('/users-email/:email', usuarioController.getUserByEmail);

// POST search user that contains name
router.post('/users-search', usuarioController.searchUserByName);

// POST create user
router.post('/users', usuarioController.createUser);

// PUT update user
router.put('/users/:id', usuarioController.updateUser);

// DELETE delete user
router.delete('/users/:id', usuarioController.deleteUser);

// POST authenticate user
router.post('/users/auth', usuarioController.authenticateUser);

module.exports = router;