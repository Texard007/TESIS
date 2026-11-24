const adminService = require('../services/admin.service');

/**
 * GET /api/admin/reportes
 */
async function getReports(req, res, next) {
  try {
    const reports = await adminService.getReports();

    res.json({
      success: true,
      data: reports,
      message: 'Reportes generados exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/usuarios
 */
async function listUsers(req, res, next) {
  try {
    const result = await adminService.listUsers(req.query);

    res.json({
      success: true,
      data: result,
      message: 'Usuarios obtenidos exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/usuarios/:id/estado
 */
async function updateUserStatus(req, res, next) {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'El campo estado es obligatorio',
      });
    }

    const user = await adminService.updateUserStatus(req.params.id, estado);

    res.json({
      success: true,
      data: user,
      message: 'Estado del usuario actualizado exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReports, listUsers, updateUserStatus };
