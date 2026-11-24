const { validationResult } = require('express-validator');
const mascotasService = require('../services/mascotas.service');

/**
 * POST /api/mascotas
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

    const mascota = await mascotasService.create(req.body, req.user.id_usuario);

    res.status(201).json({
      success: true,
      data: mascota,
      message: 'Mascota registrada exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/mascotas
 */
async function list(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    const result = await mascotasService.list(req.query);

    res.json({
      success: true,
      data: result,
      message: 'Mascotas obtenidas exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/mascotas/:id
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

    const mascota = await mascotasService.getById(req.params.id);

    res.json({
      success: true,
      data: mascota,
      message: 'Mascota obtenida exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/mascotas/:id
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

    const mascota = await mascotasService.update(req.params.id, req.body);

    res.json({
      success: true,
      data: mascota,
      message: 'Mascota actualizada exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/mascotas/:id
 */
async function remove(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    await mascotasService.remove(req.params.id);

    res.json({
      success: true,
      data: null,
      message: 'Mascota eliminada exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/mascotas/:id/fotos
 */
async function uploadPhotos(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Debes subir al menos una imagen',
      });
    }

    const photos = await mascotasService.uploadPhotos(
      req.params.id,
      req.files,
      req.body.es_principal_index
    );

    res.status(201).json({
      success: true,
      data: photos,
      message: 'Fotos subidas exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, update, remove, uploadPhotos };
