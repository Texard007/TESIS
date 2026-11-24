const { body, param } = require('express-validator');

const createExpedienteValidator = [
  body('id_mascota')
    .custom((val, { req }) => {
      const id = val || req.body.mascotaId || req.params.id;
      if (!id || isNaN(parseInt(id, 10))) {
        throw new Error('El id de la mascota es obligatorio');
      }
      req.body.id_mascota = parseInt(id, 10);
      return true;
    }),

  body('vacunas')
    .optional(),

  body('diagnostico')
    .optional()
    .trim(),

  body('tratamientos')
    .custom((val, { req }) => {
      req.body.tratamientos = val || req.body.tratamiento || null;
      return true;
    }),
];

const updateExpedienteValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de expediente inválido'),

  body('vacunas')
    .optional(),

  body('diagnostico')
    .optional()
    .trim(),

  body('tratamientos')
    .custom((val, { req }) => {
      req.body.tratamientos = val || req.body.tratamiento || null;
      return true;
    }),
];

const idParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
];

module.exports = {
  createExpedienteValidator,
  updateExpedienteValidator,
  idParamValidator,
};
