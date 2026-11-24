const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
      message: 'Usuario registrado exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: errors.array(),
        message: 'Errores de validación',
      });
    }

    const { correo, password } = req.body;
    const result = await authService.login(correo, password);

    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
      message: 'Inicio de sesión exitoso',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id_usuario);

    res.json({
      success: true,
      data: user,
      message: 'Perfil obtenido exitosamente',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
