const pool = require('../config/db');

/**
 * Create a medical record.
 */
async function create(data, id_veterinario) {
  const { id_mascota, vacunas, diagnostico, tratamientos } = data;

  // Verify pet exists
  const petCheck = await pool.query(
    `SELECT id_mascota FROM mascotas WHERE id_mascota = $1`,
    [id_mascota]
  );
  if (petCheck.rows.length === 0) {
    throw Object.assign(new Error('Mascota no encontrada'), { statusCode: 404 });
  }

  const result = await pool.query(
    `INSERT INTO expedientes_medicos (id_mascota, id_veterinario, vacunas, diagnostico, tratamientos)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      id_mascota,
      id_veterinario,
      JSON.stringify(vacunas || []),
      diagnostico || null,
      tratamientos || null,
    ]
  );

  return result.rows[0];
}

/**
 * Get medical records for a pet.
 */
async function getByMascota(id_mascota) {
  const result = await pool.query(
    `SELECT e.*, u.nombre AS veterinario_nombre
     FROM expedientes_medicos e
     JOIN usuarios u ON u.id_usuario = e.id_veterinario
     WHERE e.id_mascota = $1
     ORDER BY e.fecha_actualizacion DESC`,
    [id_mascota]
  );

  return result.rows;
}

/**
 * Get a single medical record by ID.
 */
async function getById(id_expediente) {
  const result = await pool.query(
    `SELECT e.*, u.nombre AS veterinario_nombre, m.nombre AS mascota_nombre
     FROM expedientes_medicos e
     JOIN usuarios u ON u.id_usuario = e.id_veterinario
     JOIN mascotas m ON m.id_mascota = e.id_mascota
     WHERE e.id_expediente = $1`,
    [id_expediente]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Expediente médico no encontrado'), { statusCode: 404 });
  }

  return result.rows[0];
}

/**
 * Update a medical record.
 */
async function update(id_expediente, data, id_veterinario) {
  const fields = [];
  const params = [];
  let paramIndex = 1;

  if (data.vacunas !== undefined) {
    fields.push(`vacunas = $${paramIndex++}`);
    params.push(JSON.stringify(data.vacunas));
  }

  if (data.diagnostico !== undefined) {
    fields.push(`diagnostico = $${paramIndex++}`);
    params.push(data.diagnostico);
  }

  if (data.tratamientos !== undefined) {
    fields.push(`tratamientos = $${paramIndex++}`);
    params.push(data.tratamientos);
  }

  if (fields.length === 0) {
    throw Object.assign(new Error('No se proporcionaron campos para actualizar'), { statusCode: 400 });
  }

  // Always update timestamp and veterinario on update
  fields.push(`fecha_actualizacion = NOW()`);
  fields.push(`id_veterinario = $${paramIndex++}`);
  params.push(id_veterinario);

  params.push(id_expediente);

  const result = await pool.query(
    `UPDATE expedientes_medicos SET ${fields.join(', ')} WHERE id_expediente = $${paramIndex} RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Expediente médico no encontrado'), { statusCode: 404 });
  }

  return result.rows[0];
}

module.exports = { create, getByMascota, getById, update };
