const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { param, body } = require('express-validator');

const router = Router();

// All admin routes require admin role
router.use(verifyToken, requireRole('administrador'));

// GET /api/admin/reportes – Platform reports
router.get('/reportes', adminController.getReports);

// GET /api/admin/usuarios – List all users
router.get('/usuarios', adminController.listUsers);

// PATCH /api/admin/usuarios/:id/estado – Toggle user status
router.patch(
  '/usuarios/:id/estado',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('estado')
      .notEmpty().withMessage('El estado es obligatorio')
      .isIn(['activo', 'inactivo', 'suspendido']).withMessage('Estado inválido'),
  ],
  adminController.updateUserStatus
);

module.exports = router;
