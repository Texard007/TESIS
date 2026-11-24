const { validationResult } = require('express-validator');
const expedientesService = require('../services/expedientes.service');

/**
 * POST /api/expedientes
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

    const expediente = await expedientesService.create(req.body, req.user.id_usuario);

    res.status(201).json({
      success: true,
      data: expediente,
      message: 'Expediente médico creado exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/expedientes/mascota/:id
 */
async function getByMascota(req, res, next) {
  try {
    const expedientes = await expedientesService.getByMascota(req.params.id);

    res.json({
      success: true,
      data: expedientes,
      message: 'Expedientes obtenidos exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/expedientes/:id
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

    const expediente = await expedientesService.getById(req.params.id);

    res.json({
      success: true,
      data: expediente,
      message: 'Expediente obtenido exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/expedientes/:id
 */
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    const expediente = await expedientesService.update(
      req.params.id,
      req.body,
      req.user.id_usuario
    );

    res.json({
      success: true,
      data: expediente,
      message: 'Expediente actualizado exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getByMascota, getById, update };
