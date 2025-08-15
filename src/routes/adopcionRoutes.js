const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adopcionController');

router.get('/adopciones', ctrl.list);
router.get('/adopciones/:id', ctrl.get);
router.post('/adopciones', ctrl.create);
router.put('/adopciones/:id/fecha', ctrl.updFecha);
router.delete('/adopciones/:id', ctrl.remove);

module.exports = router;
