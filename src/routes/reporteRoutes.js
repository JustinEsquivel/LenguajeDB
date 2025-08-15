const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reporteController');

router.get('/reportes', ctrl.list);
router.get('/reportes/:id', ctrl.get);
router.post('/reportes', ctrl.create);
router.put('/reportes/:id', ctrl.update);
router.delete('/reportes/:id', ctrl.remove);

module.exports = router;
