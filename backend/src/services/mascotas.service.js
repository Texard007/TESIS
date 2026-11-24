const pool = require('../config/db');

/**
 * Create a new pet listing.
 */
async function create(data, id_publicador) {
  const {
    nombre, especie, raza, edad_aprox, sexo, tamano,
    estado, descripcion, id_rescate,
  } = data;

  const result = await pool.query(
    `INSERT INTO mascotas
       (nombre, especie, raza, edad_aprox, sexo, tamano, estado, descripcion, id_rescate, id_publicador)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      nombre, especie, raza || null, edad_aprox || null, sexo, tamano,
      estado || 'en_rescate', descripcion || null, id_rescate || null, id_publicador,
    ]
  );

  return result.rows[0];
}

/**
 * List pets with filters, search, and pagination.
 */
async function list(filters) {
  const {
    especie, estado, tamano, sexo, search,
    page = 1, limit = 12,
  } = filters;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (especie) {
    conditions.push(`m.especie = $${paramIndex++}`);
    params.push(especie);
  }

  if (estado) {
    conditions.push(`m.estado = $${paramIndex++}`);
    params.push(estado);
  }

  if (tamano) {
    conditions.push(`m.tamano = $${paramIndex++}`);
    params.push(tamano);
  }

  if (sexo) {
    conditions.push(`m.sexo = $${paramIndex++}`);
    params.push(sexo);
  }

  if (search) {
    conditions.push(`(m.nombre ILIKE $${paramIndex} OR m.descripcion ILIKE $${paramIndex} OR m.raza ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  // Count total
  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM mascotas m ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Fetch page with principal photo
  const dataResult = await pool.query(
    `SELECT m.*,
            f.url_imagen AS foto_principal
     FROM mascotas m
     LEFT JOIN fotos_mascota f ON f.id_mascota = m.id_mascota AND f.es_principal = TRUE
     ${whereClause}
     ORDER BY m.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, parseInt(limit, 10), offset]
  );

  return {
    mascotas: dataResult.rows,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    },
  };
}

/**
 * Get a single pet by ID with all photos.
 */
async function getById(id_mascota) {
  const mascotaResult = await pool.query(
    `SELECT m.*, u.nombre AS publicador_nombre
     FROM mascotas m
     JOIN usuarios u ON u.id_usuario = m.id_publicador
     WHERE m.id_mascota = $1`,
    [id_mascota]
  );

  if (mascotaResult.rows.length === 0) {
    throw Object.assign(new Error('Mascota no encontrada'), { statusCode: 404 });
  }

  const fotosResult = await pool.query(
    `SELECT id_foto, url_imagen, es_principal
     FROM fotos_mascota WHERE id_mascota = $1 ORDER BY es_principal DESC, id_foto ASC`,
    [id_mascota]
  );

  return { ...mascotaResult.rows[0], fotos: fotosResult.rows };
}

/**
 * Update a pet.
 */
async function update(id_mascota, data) {
  const fields = [];
  const params = [];
  let paramIndex = 1;

  const allowedFields = [
    'nombre', 'especie', 'raza', 'edad_aprox', 'sexo',
    'tamano', 'estado', 'descripcion', 'id_rescate',
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`);
      params.push(data[field]);
    }
  }

  if (fields.length === 0) {
    throw Object.assign(new Error('No se proporcionaron campos para actualizar'), { statusCode: 400 });
  }

  params.push(id_mascota);

  const result = await pool.query(
    `UPDATE mascotas SET ${fields.join(', ')} WHERE id_mascota = $${paramIndex} RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Mascota no encontrada'), { statusCode: 404 });
  }

  return result.rows[0];
}

/**
 * Delete a pet.
 */
async function remove(id_mascota) {
  const result = await pool.query(
    `DELETE FROM mascotas WHERE id_mascota = $1 RETURNING id_mascota`,
    [id_mascota]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Mascota no encontrada'), { statusCode: 404 });
  }

  return result.rows[0];
}

/**
 * Upload photos for a pet.
 */
async function uploadPhotos(id_mascota, files, es_principal_index) {
  // Verify pet exists
  const petCheck = await pool.query(
    `SELECT id_mascota FROM mascotas WHERE id_mascota = $1`,
    [id_mascota]
  );

  if (petCheck.rows.length === 0) {
    throw Object.assign(new Error('Mascota no encontrada'), { statusCode: 404 });
  }

  const photos = [];

  for (let i = 0; i < files.length; i++) {
    const isPrincipal = i === parseInt(es_principal_index || 0, 10);

    // If this photo is principal, unset any existing principal
    if (isPrincipal) {
      await pool.query(
        `UPDATE fotos_mascota SET es_principal = FALSE WHERE id_mascota = $1 AND es_principal = TRUE`,
        [id_mascota]
      );
    }

    const result = await pool.query(
      `INSERT INTO fotos_mascota (id_mascota, url_imagen, es_principal)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_mascota, `/uploads/${files[i].filename}`, isPrincipal]
    );

    photos.push(result.rows[0]);
  }

  return photos;
}

module.exports = { create, list, getById, update, remove, uploadPhotos };
