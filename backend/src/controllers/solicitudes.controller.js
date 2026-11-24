const { validationResult } = require('express-validator');
const solicitudesService = require('../services/solicitudes.service');

/**
 * POST /api/solicitudes
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

    const solicitud = await solicitudesService.create(req.body, req.user.id_usuario);

    res.status(201).json({
      success: true,
      data: solicitud,
      message: 'Solicitud de adopción creada exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/solicitudes
 */
async function list(req, res, next) {
  try {
    const result = await solicitudesService.list(req.user, req.query);

    res.json({
      success: true,
      data: result,
      message: 'Solicitudes obtenidas exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/solicitudes/:id
 */
async function getById(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    const solicitud = await solicitudesService.getById(req.params.id);

    res.json({
      success: true,
      data: solicitud,
      message: 'Solicitud obtenida exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/solicitudes/:id/evaluar
 */
async function evaluate(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    const solicitud = await solicitudesService.evaluate(req.params.id, req.body);

    res.json({
      success: true,
      data: solicitud,
      message: 'Solicitud evaluada exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/solicitudes/:id/citas
 */
async function createCita(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    const cita = await solicitudesService.createCita(req.params.id, req.body);

    res.status(201).json({
      success: true,
      data: cita,
      message: 'Cita creada exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, evaluate, createCita };
