const express = require('express');
const router = express.Router();
const campanaController = require('../controllers/campanaController');

router.get('/campanas-activas', campanaController.listActivas);
router.get('/campanas',          campanaController.listAll);
router.get('/campanas/:id',      campanaController.getById);

router.post('/campanas',         campanaController.create);
router.put('/campanas/:id',      campanaController.update);
router.delete('/campanas/:id',   campanaController.delete);

router.get('/campanas/:id/total-recaudado', campanaController.total);

module.exports = router;
