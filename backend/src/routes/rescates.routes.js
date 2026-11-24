const { Router } = require('express');
const rescatesController = require('../controllers/rescates.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { body, param } = require('express-validator');

const router = Router();

const createRescateValidator = [
  body('ubicacion')
    .trim()
    .notEmpty().withMessage('La ubicación es obligatoria')
    .isLength({ max: 300 }).withMessage('La ubicación no puede exceder 300 caracteres'),

  body('fecha_rescate')
    .optional(),

  body('notas')
    .custom((val, { req }) => {
      req.body.notas = val || req.body.descripcion || req.body.observaciones || null;
      return true;
    }),
];

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
];

// POST /api/rescates – Only rescatista can create
router.post(
  '/',
  verifyToken,
  requireRole('rescatista'),
  createRescateValidator,
  rescatesController.create
);

// GET /api/rescates – Rescatista sees own, admin sees all
router.get(
  '/',
  verifyToken,
  requireRole('rescatista', 'administrador'),
  rescatesController.list
);

// GET /api/rescates/:id
router.get(
  '/:id',
  verifyToken,
  requireRole('rescatista', 'administrador'),
  idParamValidator,
  rescatesController.getById
);

module.exports = router;
