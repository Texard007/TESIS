const pool = require('../config/db');

/**
 * Create an adoption request.
 */
async function create(data, id_adoptante) {
  const { id_mascota, datos_formulario } = data;

  // Verify pet exists and is available
  const petCheck = await pool.query(
    `SELECT id_mascota, estado FROM mascotas WHERE id_mascota = $1`,
    [id_mascota]
  );

  if (petCheck.rows.length === 0) {
    throw Object.assign(new Error('Mascota no encontrada'), { statusCode: 404 });
  }

  if (petCheck.rows[0].estado === 'adoptada') {
    throw Object.assign(new Error('Esta mascota ya fue adoptada'), { statusCode: 400 });
  }

  const result = await pool.query(
    `INSERT INTO solicitudes_adopcion (id_mascota, id_adoptante, datos_formulario)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id_mascota, id_adoptante, JSON.stringify(datos_formulario || {})]
  );

  return result.rows[0];
}

/**
 * List adoption requests with filters.
 * Adoptantes see their own. Rescatistas see requests for their pets. Admin sees all.
 */
async function list(user, filters = {}) {
  const { estado, page = 1, limit = 20 } = filters;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (user.rol === 'adoptante') {
    conditions.push(`s.id_adoptante = $${paramIndex++}`);
    params.push(user.id_usuario);
  } else if (user.rol === 'rescatista') {
    conditions.push(`m.id_publicador = $${paramIndex++}`);
    params.push(user.id_usuario);
  }

  if (estado) {
    conditions.push(`s.estado = $${paramIndex++}`);
    params.push(estado);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM solicitudes_adopcion s
     JOIN mascotas m ON m.id_mascota = s.id_mascota
     ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const dataResult = await pool.query(
    `SELECT s.*,
            m.nombre AS mascota_nombre, m.especie, m.estado AS mascota_estado,
            u.nombre AS adoptante_nombre, u.correo AS adoptante_correo
     FROM solicitudes_adopcion s
     JOIN mascotas m ON m.id_mascota = s.id_mascota
     JOIN usuarios u ON u.id_usuario = s.id_adoptante
     ${whereClause}
     ORDER BY s.fecha_solicitud DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, parseInt(limit, 10), offset]
  );

  return {
    solicitudes: dataResult.rows,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    },
  };
}

/**
 * Get a single adoption request by ID.
 */
async function getById(id_solicitud) {
  const result = await pool.query(
    `SELECT s.*,
            m.nombre AS mascota_nombre, m.especie, m.estado AS mascota_estado,
            u.nombre AS adoptante_nombre, u.correo AS adoptante_correo, u.telefono AS adoptante_telefono
     FROM solicitudes_adopcion s
     JOIN mascotas m ON m.id_mascota = s.id_mascota
     JOIN usuarios u ON u.id_usuario = s.id_adoptante
     WHERE s.id_solicitud = $1`,
    [id_solicitud]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Solicitud no encontrada'), { statusCode: 404 });
  }

  // Also fetch appointments for this solicitud
  const citasResult = await pool.query(
    `SELECT * FROM citas_adopcion WHERE id_solicitud = $1 ORDER BY fecha_hora DESC`,
    [id_solicitud]
  );

  return { ...result.rows[0], citas: citasResult.rows };
}

/**
 * Evaluate (approve/deny) an adoption request.
 * When approved, auto-update pet status to 'adoptada'.
 */
async function evaluate(id_solicitud, data) {
  const { estado, motivo_decision } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check the solicitud exists
    const solCheck = await client.query(
      `SELECT s.id_solicitud, s.id_mascota, s.estado AS estado_actual
       FROM solicitudes_adopcion s WHERE s.id_solicitud = $1`,
      [id_solicitud]
    );

    if (solCheck.rows.length === 0) {
      throw Object.assign(new Error('Solicitud no encontrada'), { statusCode: 404 });
    }

    const solicitud = solCheck.rows[0];

    if (solicitud.estado_actual === 'aprobada' || solicitud.estado_actual === 'rechazada') {
      throw Object.assign(new Error('Esta solicitud ya fue evaluada'), { statusCode: 400 });
    }

    // Update the solicitud
    const updateResult = await client.query(
      `UPDATE solicitudes_adopcion
       SET estado = $1, motivo_decision = $2
       WHERE id_solicitud = $3
       RETURNING *`,
      [estado, motivo_decision || null, id_solicitud]
    );

    // If approved, update pet status to 'adoptada' and reject other pending requests
    if (estado === 'aprobada') {
      await client.query(
        `UPDATE mascotas SET estado = 'adoptada' WHERE id_mascota = $1`,
        [solicitud.id_mascota]
      );

      // Auto-reject other pending/in-review requests for the same pet
      await client.query(
        `UPDATE solicitudes_adopcion
         SET estado = 'rechazada', motivo_decision = 'Otra solicitud fue aprobada para esta mascota'
         WHERE id_mascota = $1 AND id_solicitud != $2 AND estado IN ('pendiente', 'en_revision')`,
        [solicitud.id_mascota, id_solicitud]
      );
    }

    await client.query('COMMIT');

    return updateResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Create an appointment for a solicitud.
 */
async function createCita(id_solicitud, data) {
  const { fecha_hora, lugar, notas } = data;

  // Verify solicitud exists
  const solCheck = await pool.query(
    `SELECT id_solicitud, estado FROM solicitudes_adopcion WHERE id_solicitud = $1`,
    [id_solicitud]
  );

  if (solCheck.rows.length === 0) {
    throw Object.assign(new Error('Solicitud no encontrada'), { statusCode: 404 });
  }

  const result = await pool.query(
    `INSERT INTO citas_adopcion (id_solicitud, fecha_hora, lugar, notas)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_solicitud, fecha_hora, lugar, notas || null]
  );

  return result.rows[0];
}

module.exports = { create, list, getById, evaluate, createCita };
