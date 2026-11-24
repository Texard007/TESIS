const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const jwtConfig = require('../config/jwt');

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

/**
 * Register a new user with their role-specific profile.
 */
async function register(userData) {
  const {
    nombre, correo, password, telefono, rol,
    // adoptante
    ingresos_aproximados, tipo_vivienda, tiene_jardin,
    // rescatista
    organizacion, zona_rescate,
    // veterinario
    numero_licencia, clinica_asociada,
    // admin
    nivel_acceso,
  } = userData;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await client.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, telefono, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre, correo, telefono, rol, estado, created_at`,
      [nombre, correo, password_hash, telefono || null, rol]
    );

    const user = userResult.rows[0];

    // Create role-specific profile
    switch (rol) {
      case 'adoptante':
        await client.query(
          `INSERT INTO perfiles_adoptante (id_usuario, ingresos_aproximados, tipo_vivienda, tiene_jardin)
           VALUES ($1, $2, $3, $4)`,
          [user.id_usuario, ingresos_aproximados || null, tipo_vivienda || null, tiene_jardin || false]
        );
        break;

      case 'rescatista':
        await client.query(
          `INSERT INTO perfiles_rescatista (id_usuario, organizacion, zona_rescate)
           VALUES ($1, $2, $3)`,
          [user.id_usuario, organizacion || null, zona_rescate || null]
        );
        break;

      case 'veterinario':
        if (!numero_licencia) {
          throw Object.assign(new Error('El número de licencia es obligatorio para veterinarios'), { statusCode: 400 });
        }
        await client.query(
          `INSERT INTO perfiles_veterinario (id_usuario, numero_licencia, clinica_asociada)
           VALUES ($1, $2, $3)`,
          [user.id_usuario, numero_licencia, clinica_asociada || null]
        );
        break;

      case 'administrador':
        await client.query(
          `INSERT INTO perfiles_administrador (id_usuario, nivel_acceso)
           VALUES ($1, $2)`,
          [user.id_usuario, nivel_acceso || 1]
        );
        break;
    }

    await client.query('COMMIT');

    const token = jwt.sign(
      { id_usuario: user.id_usuario, rol: user.rol },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiration }
    );

    return { user, token };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Login with lockout logic: 3 failed attempts → 15 min block.
 */
async function login(correo, password) {
  const result = await pool.query(
    `SELECT id_usuario, nombre, correo, password_hash, telefono, rol, estado,
            intentos_fallidos, bloqueado_hasta
     FROM usuarios WHERE correo = $1`,
    [correo]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 });
  }

  const user = result.rows[0];

  // Check if account is suspended/inactive
  if (user.estado !== 'activo') {
    throw Object.assign(new Error('Tu cuenta está suspendida o inactiva. Contacta al administrador.'), { statusCode: 403 });
  }

  // Check lockout
  if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
    const remaining = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 60000);
    throw Object.assign(
      new Error(`Cuenta bloqueada temporalmente. Intenta de nuevo en ${remaining} minuto(s).`),
      { statusCode: 429 }
    );
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    const newAttempts = user.intentos_fallidos + 1;

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      // Lock the account
      await pool.query(
        `UPDATE usuarios
         SET intentos_fallidos = $1, bloqueado_hasta = NOW() + INTERVAL '${LOCKOUT_MINUTES} minutes'
         WHERE id_usuario = $2`,
        [newAttempts, user.id_usuario]
      );
      throw Object.assign(
        new Error(`Cuenta bloqueada por ${LOCKOUT_MINUTES} minutos debido a múltiples intentos fallidos.`),
        { statusCode: 429 }
      );
    } else {
      await pool.query(
        `UPDATE usuarios SET intentos_fallidos = $1 WHERE id_usuario = $2`,
        [newAttempts, user.id_usuario]
      );
      throw Object.assign(
        new Error(`Credenciales inválidas. Intentos restantes: ${MAX_FAILED_ATTEMPTS - newAttempts}`),
        { statusCode: 401 }
      );
    }
  }

  // Successful login: reset failed attempts
  await pool.query(
    `UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = $1`,
    [user.id_usuario]
  );

  const token = jwt.sign(
    { id_usuario: user.id_usuario, rol: user.rol },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiration }
  );

  return {
    user: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.rol,
      estado: user.estado,
    },
    token,
  };
}

/**
 * Get current user with their role-specific profile.
 */
async function getMe(id_usuario) {
  const userResult = await pool.query(
    `SELECT id_usuario, nombre, correo, telefono, rol, estado, created_at
     FROM usuarios WHERE id_usuario = $1`,
    [id_usuario]
  );

  if (userResult.rows.length === 0) {
    throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
  }

  const user = userResult.rows[0];
  let profile = null;

  const profileTableMap = {
    adoptante: 'perfiles_adoptante',
    rescatista: 'perfiles_rescatista',
    veterinario: 'perfiles_veterinario',
    administrador: 'perfiles_administrador',
  };

  const tableName = profileTableMap[user.rol];
  if (tableName) {
    const profileResult = await pool.query(
      `SELECT * FROM ${tableName} WHERE id_usuario = $1`,
      [id_usuario]
    );
    if (profileResult.rows.length > 0) {
      const { id_usuario: _, ...profileData } = profileResult.rows[0];
      profile = profileData;
    }
  }

  return { ...user, perfil: profile };
}

module.exports = { register, login, getMe };
