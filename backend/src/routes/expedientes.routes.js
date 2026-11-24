const { Router } = require('express');
const expedientesController = require('../controllers/expedientes.controller');
const {
  createExpedienteValidator,
  updateExpedienteValidator,
  idParamValidator,
} = require('../validators/expedientes.validator');
const { verifyToken, requireRole } = require('../middlewares/auth');

const router = Router();

// POST /api/expedientes – Only veterinario/admin can create
router.post(
  '/',
  verifyToken,
  requireRole('veterinario', 'administrador'),
  createExpedienteValidator,
  expedientesController.create
);

// GET /api/expedientes/mascota/:id – Get records for a pet (all authenticated)
router.get(
  '/mascota/:id',
  verifyToken,
  idParamValidator,
  expedientesController.getByMascota
);

// GET /api/expedientes/:id – Get single record
router.get(
  '/:id',
  verifyToken,
  idParamValidator,
  expedientesController.getById
);

// PUT /api/expedientes/:id – Only veterinario/admin can update
router.put(
  '/:id',
  verifyToken,
  requireRole('veterinario', 'administrador'),
  updateExpedienteValidator,
  expedientesController.update
);

module.exports = router;
