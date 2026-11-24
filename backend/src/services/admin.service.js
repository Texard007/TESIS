const pool = require('../config/db');

/**
 * Generate platform reports: counts of users by role, pets by status, solicitudes by status.
 */
async function getReports() {
  const [usersRes, petsRes, solicitudesRes, rescatesRes] = await Promise.all([
    pool.query(
      `SELECT rol, COUNT(*)::int AS total FROM usuarios GROUP BY rol ORDER BY rol`
    ),
    pool.query(
      `SELECT estado, COUNT(*)::int AS total FROM mascotas GROUP BY estado ORDER BY estado`
    ),
    pool.query(
      `SELECT estado, COUNT(*)::int AS total FROM solicitudes_adopcion GROUP BY estado ORDER BY estado`
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total FROM rescates`
    ),
  ]);

  // Total counts
  const totalUsersRes = await pool.query(`SELECT COUNT(*)::int AS total FROM usuarios`);
  const totalPetsRes = await pool.query(`SELECT COUNT(*)::int AS total FROM mascotas`);

  return {
    usuarios: {
      total: totalUsersRes.rows[0].total,
      por_rol: usersRes.rows.reduce((acc, row) => {
        acc[row.rol] = row.total;
        return acc;
      }, {}),
    },
    mascotas: {
      total: totalPetsRes.rows[0].total,
      por_estado: petsRes.rows.reduce((acc, row) => {
        acc[row.estado] = row.total;
        return acc;
      }, {}),
    },
    solicitudes: {
      por_estado: solicitudesRes.rows.reduce((acc, row) => {
        acc[row.estado] = row.total;
        return acc;
      }, {}),
    },
    rescates: {
      total: rescatesRes.rows[0].total,
    },
  };
}

/**
 * List all users with pagination and optional filters.
 */
async function listUsers(filters = {}) {
  const { rol, estado, search, page = 1, limit = 20 } = filters;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (rol) {
    conditions.push(`u.rol = $${paramIndex++}`);
    params.push(rol);
  }

  if (estado) {
    conditions.push(`u.estado = $${paramIndex++}`);
    params.push(estado);
  }

  if (search) {
    conditions.push(`(u.nombre ILIKE $${paramIndex} OR u.correo ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM usuarios u ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const dataResult = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.correo, u.telefono, u.rol, u.estado, u.created_at
     FROM usuarios u
     ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, parseInt(limit, 10), offset]
  );

  return {
    usuarios: dataResult.rows,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    },
  };
}

/**
 * Update a user's estado (activo, inactivo, suspendido).
 */
async function updateUserStatus(id_usuario, nuevoEstado) {
  const validEstados = ['activo', 'inactivo', 'suspendido'];
  if (!validEstados.includes(nuevoEstado)) {
    throw Object.assign(new Error('Estado de usuario inválido'), { statusCode: 400 });
  }

  const result = await pool.query(
    `UPDATE usuarios SET estado = $1 WHERE id_usuario = $2
     RETURNING id_usuario, nombre, correo, rol, estado`,
    [nuevoEstado, id_usuario]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
  }

  return result.rows[0];
}

module.exports = { getReports, listUsers, updateUserStatus };
