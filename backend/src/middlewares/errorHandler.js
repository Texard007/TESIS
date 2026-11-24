/**
 * Centralized error handling middleware.
 * Catches all errors forwarded via next(err).
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      data: null,
      message: 'El archivo excede el tamaño máximo permitido',
    });
  }

  // Multer unexpected field
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Campo de archivo inesperado',
    });
  }

  // Express-validator or custom validation errors
  if (err.status === 400 || err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      data: null,
      message: err.message || 'Solicitud inválida',
    });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      data: null,
      message: 'El registro ya existe',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Referencia a un registro inexistente',
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
  });
};

module.exports = errorHandler;
