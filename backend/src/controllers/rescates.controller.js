const { validationResult } = require('express-validator');
const rescatesService = require('../services/rescates.service');

/**
 * POST /api/rescates
 */
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    const rescate = await rescatesService.create(req.body, req.user.id_usuario);

    res.status(201).json({
      success: true,
      data: rescate,
      message: 'Rescate registrado exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/rescates
 */
async function list(req, res, next) {
  try {
    const result = await rescatesService.list(req.user, req.query);

    res.json({
      success: true,
      data: result,
      message: 'Rescates obtenidos exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/rescates/:id
 */
async function getById(req, res, next) {
  try {
    const rescate = await rescatesService.getById(req.params.id);

    res.json({
      success: true,
      data: rescate,
      message: 'Rescate obtenido exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById };
