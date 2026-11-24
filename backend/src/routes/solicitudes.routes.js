const { Router } = require('express');
const solicitudesController = require('../controllers/solicitudes.controller');
const {
  createSolicitudValidator,
  evaluateSolicitudValidator,
  createCitaValidator,
  idParamValidator,
} = require('../validators/solicitudes.validator');
const { verifyToken, requireRole } = require('../middlewares/auth');

const router = Router();

// POST /api/solicitudes – Adoptante creates a request
router.post(
  '/',
  verifyToken,
  requireRole('adoptante'),
  createSolicitudValidator,
  solicitudesController.create
);

// GET /api/solicitudes – List requests (role-scoped)
router.get(
  '/',
  verifyToken,
  requireRole('adoptante', 'rescatista', 'administrador'),
  solicitudesController.list
);

// GET /api/solicitudes/:id – Get single request detail
router.get(
  '/:id',
  verifyToken,
  requireRole('adoptante', 'rescatista', 'administrador'),
  idParamValidator,
  solicitudesController.getById
);

// PATCH /api/solicitudes/:id/evaluar – Rescatista/admin approves or denies
router.patch(
  '/:id/evaluar',
  verifyToken,
  requireRole('rescatista', 'administrador'),
  evaluateSolicitudValidator,
  solicitudesController.evaluate
);

// POST /api/solicitudes/:id/citas – Create appointment for a request
router.post(
  '/:id/citas',
  verifyToken,
  requireRole('rescatista', 'administrador', 'adoptante'),
  createCitaValidator,
  solicitudesController.createCita
);

module.exports = router;
