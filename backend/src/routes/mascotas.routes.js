const { Router } = require('express');
const mascotasController = require('../controllers/mascotas.controller');
const expedientesController = require('../controllers/expedientes.controller');
const {
  createMascotaValidator,
  updateMascotaValidator,
  listMascotasValidator,
  idParamValidator,
} = require('../validators/mascotas.validator');
const { verifyToken, requireRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = Router();

// GET /api/mascotas – Public listing with filters and pagination
router.get('/', listMascotasValidator, mascotasController.list);

// GET /api/mascotas/:id – Public single pet detail
router.get('/:id', idParamValidator, mascotasController.getById);

// POST /api/mascotas – Rescatista, Veterinario, or Admin can publish
router.post(
  '/',
  verifyToken,
  requireRole('rescatista', 'veterinario', 'administrador'),
  createMascotaValidator,
  mascotasController.create
);

// PUT & PATCH /api/mascotas/:id – Update pet (rescatista, veterinario, admin)
router.put(
  '/:id',
  verifyToken,
  requireRole('rescatista', 'veterinario', 'administrador'),
  updateMascotaValidator,
  mascotasController.update
);

router.patch(
  '/:id',
  verifyToken,
  requireRole('rescatista', 'veterinario', 'administrador'),
  updateMascotaValidator,
  mascotasController.update
);

// DELETE /api/mascotas/:id – Delete pet (rescatista, admin)
router.delete(
  '/:id',
  verifyToken,
  requireRole('rescatista', 'administrador'),
  idParamValidator,
  mascotasController.remove
);

// POST /api/mascotas/:id/fotos – Upload photos (rescatista, veterinario, admin)
router.post(
  '/:id/fotos',
  verifyToken,
  requireRole('rescatista', 'veterinario', 'administrador'),
  upload.any(),
  mascotasController.uploadPhotos
);

// Expediente médico asociado a la mascota
// GET /api/mascotas/:id/expediente
router.get('/:id/expediente', verifyToken, idParamValidator, expedientesController.getByMascota);

// POST /api/mascotas/:id/expediente
router.post(
  '/:id/expediente',
  verifyToken,
  requireRole('veterinario', 'administrador'),
  (req, _res, next) => {
    req.body.id_mascota = parseInt(req.params.id, 10);
    next();
  },
  expedientesController.create
);

module.exports = router;
