const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches decoded user payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token de acceso no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token expirado',
      });
    }
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token inválido',
    });
  }
};

/**
 * Role-based access control middleware factory.
 * @param  {...string} roles - Allowed roles (e.g. 'administrador', 'veterinario')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Autenticación requerida',
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
