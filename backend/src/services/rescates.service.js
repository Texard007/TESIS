const pool = require('../config/db');

/**
 * Create a new rescue record.
 */
async function create(data, id_rescatista) {
  const { ubicacion, fecha_rescate, notas } = data;

  const result = await pool.query(
    `INSERT INTO rescates (id_rescatista, ubicacion, fecha_rescate, notas)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_rescatista, ubicacion, fecha_rescate || new Date().toISOString().split('T')[0], notas || null]
  );

  return result.rows[0];
}

/**
 * List rescues. If rescatista, only their own. Admin sees all.
 */
async function list(user, filters = {}) {
  const { page = 1, limit = 20 } = filters;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (user.rol === 'rescatista') {
    conditions.push(`r.id_rescatista = $${paramIndex++}`);
    params.push(user.id_usuario);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM rescates r ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const dataResult = await pool.query(
    `SELECT r.*, u.nombre AS rescatista_nombre
     FROM rescates r
     JOIN usuarios u ON u.id_usuario = r.id_rescatista
     ${whereClause}
     ORDER BY r.fecha_rescate DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, parseInt(limit, 10), offset]
  );

  return {
    rescates: dataResult.rows,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    },
  };
}

/**
 * Get a rescue by ID.
 */
async function getById(id_rescate) {
  const result = await pool.query(
    `SELECT r.*, u.nombre AS rescatista_nombre
     FROM rescates r
     JOIN usuarios u ON u.id_usuario = r.id_rescatista
     WHERE r.id_rescate = $1`,
    [id_rescate]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Rescate no encontrado'), { statusCode: 404 });
  }

  return result.rows[0];
}

module.exports = { create, list, getById };
