const { body, param } = require('express-validator');

const createSolicitudValidator = [
  body('id_mascota')
    .custom((val, { req }) => {
      const id = val || req.body.mascotaId;
      if (!id || isNaN(parseInt(id, 10))) {
        throw new Error('El id de la mascota es obligatorio');
      }
      req.body.id_mascota = parseInt(id, 10);
      return true;
    }),

  body('datos_formulario')
    .optional()
    .isObject().withMessage('datos_formulario debe ser un objeto JSON'),
];

const evaluateSolicitudValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de solicitud inválido'),

  body('estado')
    .notEmpty().withMessage('El estado es obligatorio')
    .isIn(['pendiente', 'en_revision', 'aprobada', 'rechazada'])
    .withMessage('Estado debe ser pendiente, en_revision, aprobada o rechazada'),

  body('motivo_decision')
    .custom((val, { req }) => {
      req.body.motivo_decision = val || req.body.comentarios || req.body.motivo || null;
      return true;
    }),
];

const createCitaValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de solicitud inválido'),

  body('fecha_hora')
    .custom((val, { req }) => {
      let fh = val || req.body.fechaHora;
      if (!fh && req.body.fecha && req.body.hora) {
        fh = `${req.body.fecha}T${req.body.hora}:00`;
      }
      if (!fh || isNaN(Date.parse(fh))) {
        throw new Error('La fecha y hora deben ser válidas');
      }
      req.body.fecha_hora = new Date(fh).toISOString();
      return true;
    }),

  body('lugar')
    .trim()
    .notEmpty().withMessage('El lugar es obligatorio')
    .isLength({ max: 300 }).withMessage('El lugar no puede exceder 300 caracteres'),

  body('notas')
    .optional()
    .trim(),
];

const idParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
];

module.exports = {
  createSolicitudValidator,
  evaluateSolicitudValidator,
  createCitaValidator,
  idParamValidator,
};
