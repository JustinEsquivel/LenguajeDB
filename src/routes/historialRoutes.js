const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/historialController');

// === Alias para mantener compatibilidad: /historial-medico ===
// CREATE / UPDATE / DELETE / GET BY ID
router.post(['/historial', '/historial-medico'], ctrl.create);
router.put(['/historial/:id', '/historial-medico/:id'], ctrl.update);
router.delete(['/historial/:id', '/historial-medico/:id'], ctrl.remove);
router.get(['/historial/:id', '/historial-medico/:id'], ctrl.getById);

// Listados por mascota (ya están bien)
router.get('/mascotas/:mascotaId/historial', ctrl.listByMascota);
router.get('/mascotas/:mascotaId/historial-activo', ctrl.listActivosByMascota);

module.exports = router;
