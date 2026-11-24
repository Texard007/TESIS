const { body, query, param } = require('express-validator');

const createMascotaValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),

  body('especie')
    .notEmpty().withMessage('La especie es obligatoria')
    .isIn(['perro', 'gato', 'conejo', 'ave', 'otro'])
    .withMessage('Especie inválida'),

  body('raza')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La raza no puede exceder 100 caracteres'),

  body('edad_aprox')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('La edad aproximada no puede exceder 50 caracteres'),

  body('sexo')
    .notEmpty().withMessage('El sexo es obligatorio')
    .isIn(['macho', 'hembra']).withMessage('Sexo inválido'),

  body('tamano')
    .notEmpty().withMessage('El tamaño es obligatorio')
    .isIn(['pequeno', 'mediano', 'grande']).withMessage('Tamaño inválido'),

  body('estado')
    .optional()
    .isIn(['en_rescate', 'en_adopcion', 'en_proceso', 'adoptada'])
    .withMessage('Estado inválido'),

  body('descripcion')
    .optional()
    .trim(),

  body('id_rescate')
    .optional()
    .isInt({ min: 1 }).withMessage('id_rescate debe ser un entero positivo'),
];

const updateMascotaValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de mascota inválido'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),

  body('especie')
    .optional()
    .isIn(['perro', 'gato', 'conejo', 'ave', 'otro'])
    .withMessage('Especie inválida'),

  body('raza')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La raza no puede exceder 100 caracteres'),

  body('edad_aprox')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('La edad aproximada no puede exceder 50 caracteres'),

  body('sexo')
    .optional()
    .isIn(['macho', 'hembra']).withMessage('Sexo inválido'),

  body('tamano')
    .optional()
    .isIn(['pequeno', 'mediano', 'grande']).withMessage('Tamaño inválido'),

  body('estado')
    .optional()
    .isIn(['en_rescate', 'en_adopcion', 'en_proceso', 'adoptada'])
    .withMessage('Estado inválido'),

  body('descripcion')
    .optional()
    .trim(),
];

const listMascotasValidator = [
  query('especie')
    .optional()
    .isIn(['perro', 'gato', 'conejo', 'ave', 'otro'])
    .withMessage('Especie inválida'),

  query('estado')
    .optional()
    .isIn(['en_rescate', 'en_adopcion', 'en_proceso', 'adoptada'])
    .withMessage('Estado inválido'),

  query('tamano')
    .optional()
    .isIn(['pequeno', 'mediano', 'grande'])
    .withMessage('Tamaño inválido'),

  query('sexo')
    .optional()
    .isIn(['macho', 'hembra'])
    .withMessage('Sexo inválido'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La búsqueda no puede exceder 100 caracteres'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
];

const idParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
];

module.exports = {
  createMascotaValidator,
  updateMascotaValidator,
  listMascotasValidator,
  idParamValidator,
};
