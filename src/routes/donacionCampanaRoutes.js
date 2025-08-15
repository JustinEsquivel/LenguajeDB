const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/donacionCampanaController');

router.get('/donaciones/:id', ctrl.getById);
router.get('/campanas/:campanaId/donaciones', ctrl.listByCampana);
router.get('/campanas/:campanaId/donaciones-total', ctrl.total);

router.post('/donaciones', ctrl.create);
router.put('/donaciones/:id', ctrl.update);
router.delete('/donaciones/:id', ctrl.remove);

module.exports = router;
