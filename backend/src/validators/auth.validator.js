const { body } = require('express-validator');

const registerValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 120 }).withMessage('El nombre no puede exceder 120 caracteres'),

  body('correo')
    .custom((val, { req }) => {
      const email = val || req.body.email;
      if (!email) {
        throw new Error('El correo es obligatorio');
      }
      req.body.correo = email.trim().toLowerCase();
      return true;
    }),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),

  body('telefono')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),

  body('rol')
    .notEmpty().withMessage('El rol es obligatorio')
    .isIn(['administrador', 'veterinario', 'rescatista', 'adoptante'])
    .withMessage('Rol inválido'),

  // Profile fields (conditional)
  body('ingresos_aproximados')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los ingresos deben ser un número positivo'),

  body('tipo_vivienda')
    .optional()
    .isIn(['casa', 'apartamento', 'quinta', 'otro'])
    .withMessage('Tipo de vivienda inválido'),

  body('tiene_jardin')
    .optional()
    .isBoolean().withMessage('tiene_jardin debe ser booleano'),

  body('organizacion')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La organización no puede exceder 200 caracteres'),

  body('zona_rescate')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La zona de rescate no puede exceder 200 caracteres'),

  body('numero_licencia')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El número de licencia no puede exceder 50 caracteres'),

  body('clinica_asociada')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La clínica no puede exceder 200 caracteres'),

  body('nivel_acceso')
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage('El nivel de acceso debe estar entre 1 y 3'),
];

const loginValidator = [
  body('correo')
    .custom((val, { req }) => {
      const email = val || req.body.email;
      if (!email) {
        throw new Error('El correo es obligatorio');
      }
      req.body.correo = email.trim().toLowerCase();
      return true;
    }),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = { registerValidator, loginValidator };
