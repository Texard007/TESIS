-- ============================================================
-- Seed Data: Plataforma de Adopción de Mascotas
-- Datos realistas – Venezuela / Zulia
-- ============================================================
-- Contraseña para todos los usuarios: Password123!
-- Hash bcrypt generado con cost factor 10
-- ============================================================

-- ============================================================
-- 1. USUARIOS (8 usuarios: 2 por rol)
-- ============================================================

INSERT INTO usuarios (nombre, correo, password_hash, telefono, rol, estado)
VALUES
    -- Administradores
    ('Carlos Alejandro Pirela',   'carlos.pirela@adoptaluz.org',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+58 424-6001001', 'administrador', 'activo'),
    ('María Gabriela Urdaneta',   'maria.urdaneta@adoptaluz.org',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+58 414-6002002', 'administrador', 'activo'),

    -- Veterinarios
    ('Dr. Luis Enrique Fuenmayor','luis.fuenmayor@vetluz.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+58 412-7001001', 'veterinario',   'activo'),
    ('Dra. Ana Patricia Molero',  'ana.molero@vetluz.com',         '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+58 414-7002002', 'veterinario',   'activo'),

    -- Rescatistas
    ('Jesús Rafael Montiel',      'jesus.montiel@rescatezulia.org','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+58 424-8001001', 'rescatista',    'activo'),
    ('Valentina Beatriz Chávez',  'valentina.chavez@patitas.org',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+58 412-8002002', 'rescatista',    'activo'),

    -- Adoptantes
    ('Andrés José Sánchez',       'andres.sanchez@gmail.com',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+58 414-9001001', 'adoptante',     'activo'),
    ('Luisa Fernanda Reyes',      'luisa.reyes@gmail.com',         '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+58 424-9002002', 'adoptante',     'activo')
ON CONFLICT (correo) DO NOTHING;

-- ============================================================
-- 2. PERFILES POR ROL
-- ============================================================

-- Administradores (IDs 1, 2)
INSERT INTO perfiles_administrador (id_usuario, nivel_acceso)
VALUES
    (1, 3),
    (2, 2)
ON CONFLICT (id_usuario) DO NOTHING;

-- Veterinarios (IDs 3, 4)
INSERT INTO perfiles_veterinario (id_usuario, numero_licencia, clinica_asociada)
VALUES
    (3, 'VET-ZUL-2019-0451', 'Clínica Veterinaria San Francisco'),
    (4, 'VET-ZUL-2021-0783', 'Centro Veterinario Costa del Lago')
ON CONFLICT (id_usuario) DO NOTHING;

-- Rescatistas (IDs 5, 6)
INSERT INTO perfiles_rescatista (id_usuario, organizacion, zona_rescate)
VALUES
    (5, 'Fundación Rescate Zulia',  'Maracaibo - Zona Norte'),
    (6, 'Patitas Sin Hogar',        'Maracaibo - Zona Sur y San Francisco')
ON CONFLICT (id_usuario) DO NOTHING;

-- Adoptantes (IDs 7, 8)
INSERT INTO perfiles_adoptante (id_usuario, ingresos_aproximados, tipo_vivienda, tiene_jardin)
VALUES
    (7, 800.00,  'casa',        TRUE),
    (8, 550.00,  'apartamento', FALSE)
ON CONFLICT (id_usuario) DO NOTHING;

-- ============================================================
-- 3. RESCATES
-- ============================================================

INSERT INTO rescates (id_rescatista, ubicacion, fecha_rescate, notas)
VALUES
    (5, 'Av. 5 de Julio, sector Indio Mara, Maracaibo',       '2026-09-15', 'Grupo de 3 cachorros abandonados en una caja cerca del mercado.'),
    (5, 'Calle 72, sector La Lago, Maracaibo',                '2026-10-02', 'Perro adulto con herida en pata delantera encontrado debajo de un puente.'),
    (6, 'Urb. La Coromoto, San Francisco, Zulia',              '2026-10-18', 'Gata preñada rescatada de terreno baldío. Dio a luz 4 gatitos.'),
    (6, 'Av. Universidad, frente a LUZ, Maracaibo',           '2026-11-01', 'Conejo doméstico abandonado en un parque.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. MASCOTAS (6 mascotas en diferentes estados)
-- ============================================================

INSERT INTO mascotas (id_rescate, id_publicador, nombre, especie, raza, edad_aprox, sexo, tamano, estado, descripcion)
VALUES
    -- Rescate 1: 2 de los 3 cachorros
    (1, 5, 'Bruno',    'perro', 'Mestizo',              '3 meses',   'macho',  'pequeno',  'en_adopcion',
     'Cachorro juguetón y cariñoso. Desparasitado y con primera vacuna.'),
    (1, 5, 'Luna',     'perro', 'Mestizo',              '3 meses',   'hembra', 'pequeno',  'en_proceso',
     'Cachorra tranquila, ideal para apartamento. Ya come sola.'),

    -- Rescate 2: perro adulto
    (2, 5, 'Rocky',    'perro', 'Criollo grande',       '4 años',    'macho',  'grande',   'en_rescate',
     'En recuperación por herida en pata. Muy noble y obediente.'),

    -- Rescate 3: gata y un gatito
    (3, 6, 'Michi',    'gato',  'Siamés mestizo',       '2 años',    'hembra', 'mediano',  'en_adopcion',
     'Gata cariñosa, esterilizada tras el parto. Se lleva bien con niños.'),
    (3, 6, 'Nube',     'gato',  'Pelo corto doméstico', '2 meses',   'macho',  'pequeno',  'adoptada',
     'Gatito blanco, muy activo. Ya adoptado por una familia en La Lago.'),

    -- Rescate 4: conejo
    (4, 6, 'Copito',   'conejo', NULL,                  '1 año',     'macho',  'pequeno',  'en_adopcion',
     'Conejo blanco muy dócil. Viene con su jaula.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. FOTOS DE MASCOTAS
-- ============================================================

INSERT INTO fotos_mascota (id_mascota, url_imagen, es_principal)
VALUES
    (1, '/uploads/mascotas/bruno_01.jpg',   TRUE),
    (1, '/uploads/mascotas/bruno_02.jpg',   FALSE),
    (2, '/uploads/mascotas/luna_01.jpg',    TRUE),
    (3, '/uploads/mascotas/rocky_01.jpg',   TRUE),
    (3, '/uploads/mascotas/rocky_02.jpg',   FALSE),
    (4, '/uploads/mascotas/michi_01.jpg',   TRUE),
    (4, '/uploads/mascotas/michi_02.jpg',   FALSE),
    (5, '/uploads/mascotas/nube_01.jpg',    TRUE),
    (6, '/uploads/mascotas/copito_01.jpg',  TRUE),
    (6, '/uploads/mascotas/copito_02.jpg',  FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. EXPEDIENTES MÉDICOS
-- ============================================================

INSERT INTO expedientes_medicos (id_mascota, id_veterinario, vacunas, diagnostico, tratamientos, fecha_actualizacion)
VALUES
    (1, 3,
     '[{"nombre": "Parvovirus", "fecha": "2026-09-25", "dosis": 1}, {"nombre": "Moquillo", "fecha": "2026-10-10", "dosis": 1}]'::JSONB,
     'Cachorro sano. Leve desnutrición al momento del rescate, ya recuperado.',
     'Desparasitación interna con Albendazol. Suplemento vitamínico por 15 días.',
     '2026-10-10'),

    (3, 3,
     '[]'::JSONB,
     'Laceración profunda en pata delantera derecha, posible atropellamiento. Sin fractura.',
     'Limpieza y sutura de herida. Antibiótico (Amoxicilina 500mg/12h x 10 días). Control semanal.',
     '2026-10-15'),

    (4, 4,
     '[{"nombre": "Triple felina", "fecha": "2026-11-01", "dosis": 1}, {"nombre": "Rabia", "fecha": "2026-11-01", "dosis": 1}]'::JSONB,
     'Gata en buen estado general. Esterilización realizada sin complicaciones.',
     'Esterilización quirúrgica. Reposo 7 días. Collar isabelino.',
     '2026-11-05')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. SOLICITUDES DE ADOPCIÓN
-- ============================================================

INSERT INTO solicitudes_adopcion (id_mascota, id_adoptante, datos_formulario, estado, motivo_decision, fecha_solicitud)
VALUES
    -- Andrés quiere adoptar a Bruno → en revisión
    (1, 7,
     '{"motivacion": "Siempre he querido un perro, tengo espacio en casa y jardín.", "experiencia_mascotas": true, "otras_mascotas": false, "ninos_en_casa": false}'::JSONB,
     'en_revision', NULL,
     '2026-11-05 10:30:00-04'),

    -- Luisa quiere adoptar a Luna → aprobada
    (2, 8,
     '{"motivacion": "Busco una compañera tranquila para mi apartamento.", "experiencia_mascotas": true, "otras_mascotas": false, "ninos_en_casa": false}'::JSONB,
     'aprobada', 'Perfil adecuado. Vivienda apropiada para mascota pequeña.',
     '2026-11-02 14:00:00-04'),

    -- Luisa también pidió a Copito → rechazada
    (6, 8,
     '{"motivacion": "Mi sobrino quiere un conejo.", "experiencia_mascotas": true, "otras_mascotas": false, "ninos_en_casa": true}'::JSONB,
     'rechazada', 'Se recomienda que el adoptante principal sea mayor de edad residente. Verificar responsable directo.',
     '2026-11-08 09:15:00-04'),

    -- Andrés quiere adoptar a Michi → pendiente
    (4, 7,
     '{"motivacion": "Mi esposa y yo queremos un gato. Tenemos experiencia con felinos.", "experiencia_mascotas": true, "otras_mascotas": false, "ninos_en_casa": false}'::JSONB,
     'pendiente', NULL,
     '2026-11-15 16:45:00-04')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. CITAS DE ADOPCIÓN
-- ============================================================

INSERT INTO citas_adopcion (id_solicitud, fecha_hora, lugar, estado, notas)
VALUES
    -- Cita para la solicitud aprobada de Luisa (Luna)
    (2, '2026-11-20 10:00:00-04', 'Sede Patitas Sin Hogar, Av. Bella Vista, Maracaibo',
     'programada', 'Traer cédula de identidad y comprobante de domicilio. Se entregará kit de bienvenida.'),

    -- Cita para la solicitud en revisión de Andrés (Bruno) — para entrevista
    (1, '2026-11-22 15:00:00-04', 'Fundación Rescate Zulia, Calle 76, Maracaibo',
     'programada', 'Entrevista presencial con el rescatista. Visita al hogar pendiente.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- FIN DEL SEED
-- ============================================================
