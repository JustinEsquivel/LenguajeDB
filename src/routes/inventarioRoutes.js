const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventarioController');

router.get('/inventario', ctrl.list);
router.get('/inventario/:id', ctrl.get);
router.post('/inventario', ctrl.create);
router.put('/inventario/:id', ctrl.update);
router.delete('/inventario/:id', ctrl.remove);

module.exports = router;
