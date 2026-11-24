-- ============================================================
-- Schema: Plataforma Colaborativa de Adopción de Mascotas
-- PostgreSQL 16
-- ============================================================

-- ============================================================
-- 1. ENUM TYPES (idempotent creation)
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario') THEN
        CREATE TYPE rol_usuario AS ENUM ('administrador', 'veterinario', 'rescatista', 'adoptante');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_mascota') THEN
        CREATE TYPE estado_mascota AS ENUM ('en_rescate', 'en_adopcion', 'en_proceso', 'adoptada');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_solicitud') THEN
        CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'en_revision', 'aprobada', 'rechazada');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_cita') THEN
        CREATE TYPE estado_cita AS ENUM ('programada', 'completada', 'cancelada');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_usuario') THEN
        CREATE TYPE estado_usuario AS ENUM ('activo', 'inactivo', 'suspendido');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_vivienda') THEN
        CREATE TYPE tipo_vivienda AS ENUM ('casa', 'apartamento', 'quinta', 'otro');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'especie_mascota') THEN
        CREATE TYPE especie_mascota AS ENUM ('perro', 'gato', 'conejo', 'ave', 'otro');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sexo_mascota') THEN
        CREATE TYPE sexo_mascota AS ENUM ('macho', 'hembra');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tamano_mascota') THEN
        CREATE TYPE tamano_mascota AS ENUM ('pequeno', 'mediano', 'grande');
    END IF;
END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- ----- USUARIOS -----
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario          SERIAL          PRIMARY KEY,
    nombre              VARCHAR(120)    NOT NULL,
    correo              VARCHAR(255)    NOT NULL UNIQUE,
    password_hash       VARCHAR(255)    NOT NULL,
    telefono            VARCHAR(20),
    rol                 rol_usuario     NOT NULL,
    estado              estado_usuario  NOT NULL DEFAULT 'activo',
    intentos_fallidos   SMALLINT        NOT NULL DEFAULT 0
                                        CHECK (intentos_fallidos >= 0),
    bloqueado_hasta     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ----- PERFILES POR ROL -----
CREATE TABLE IF NOT EXISTS perfiles_adoptante (
    id_usuario          INT             PRIMARY KEY
                                        REFERENCES usuarios (id_usuario)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    ingresos_aproximados NUMERIC(12,2)  CHECK (ingresos_aproximados >= 0),
    tipo_vivienda       tipo_vivienda,
    tiene_jardin        BOOLEAN         NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS perfiles_rescatista (
    id_usuario          INT             PRIMARY KEY
                                        REFERENCES usuarios (id_usuario)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    organizacion        VARCHAR(200),
    zona_rescate        VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS perfiles_veterinario (
    id_usuario          INT             PRIMARY KEY
                                        REFERENCES usuarios (id_usuario)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    numero_licencia     VARCHAR(50)     NOT NULL UNIQUE,
    clinica_asociada    VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS perfiles_administrador (
    id_usuario          INT             PRIMARY KEY
                                        REFERENCES usuarios (id_usuario)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    nivel_acceso        SMALLINT        NOT NULL DEFAULT 1
                                        CHECK (nivel_acceso BETWEEN 1 AND 3)
);

-- ----- RESCATES -----
CREATE TABLE IF NOT EXISTS rescates (
    id_rescate          SERIAL          PRIMARY KEY,
    id_rescatista       INT             NOT NULL
                                        REFERENCES usuarios (id_usuario)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    ubicacion           VARCHAR(300)    NOT NULL,
    fecha_rescate       DATE            NOT NULL DEFAULT CURRENT_DATE,
    notas               TEXT
);

-- ----- MASCOTAS -----
CREATE TABLE IF NOT EXISTS mascotas (
    id_mascota          SERIAL          PRIMARY KEY,
    id_rescate          INT
                                        REFERENCES rescates (id_rescate)
                                        ON DELETE SET NULL ON UPDATE CASCADE,
    id_publicador       INT             NOT NULL
                                        REFERENCES usuarios (id_usuario)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    nombre              VARCHAR(100)    NOT NULL,
    especie             especie_mascota NOT NULL,
    raza                VARCHAR(100),
    edad_aprox          VARCHAR(50),
    sexo                sexo_mascota    NOT NULL,
    tamano              tamano_mascota  NOT NULL,
    estado              estado_mascota  NOT NULL DEFAULT 'en_rescate',
    descripcion         TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ----- FOTOS DE MASCOTA -----
CREATE TABLE IF NOT EXISTS fotos_mascota (
    id_foto             SERIAL          PRIMARY KEY,
    id_mascota          INT             NOT NULL
                                        REFERENCES mascotas (id_mascota)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    url_imagen          VARCHAR(500)    NOT NULL,
    es_principal        BOOLEAN         NOT NULL DEFAULT FALSE
);

-- ----- EXPEDIENTES MÉDICOS -----
CREATE TABLE IF NOT EXISTS expedientes_medicos (
    id_expediente       SERIAL          PRIMARY KEY,
    id_mascota          INT             NOT NULL
                                        REFERENCES mascotas (id_mascota)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    id_veterinario      INT             NOT NULL
                                        REFERENCES usuarios (id_usuario)
                                        ON DELETE RESTRICT ON UPDATE CASCADE,
    vacunas             JSONB           NOT NULL DEFAULT '[]'::JSONB,
    diagnostico         TEXT,
    tratamientos        TEXT,
    fecha_actualizacion TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ----- SOLICITUDES DE ADOPCIÓN -----
CREATE TABLE IF NOT EXISTS solicitudes_adopcion (
    id_solicitud        SERIAL          PRIMARY KEY,
    id_mascota          INT             NOT NULL
                                        REFERENCES mascotas (id_mascota)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    id_adoptante        INT             NOT NULL
                                        REFERENCES usuarios (id_usuario)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    datos_formulario    JSONB           NOT NULL DEFAULT '{}'::JSONB,
    estado              estado_solicitud NOT NULL DEFAULT 'pendiente',
    motivo_decision     TEXT,
    fecha_solicitud     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Evitar solicitudes duplicadas activas del mismo adoptante para la misma mascota
    CONSTRAINT uq_solicitud_activa UNIQUE (id_mascota, id_adoptante)
);

-- ----- CITAS DE ADOPCIÓN -----
CREATE TABLE IF NOT EXISTS citas_adopcion (
    id_cita             SERIAL          PRIMARY KEY,
    id_solicitud        INT             NOT NULL
                                        REFERENCES solicitudes_adopcion (id_solicitud)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
    fecha_hora          TIMESTAMPTZ     NOT NULL,
    lugar               VARCHAR(300)    NOT NULL,
    estado              estado_cita     NOT NULL DEFAULT 'programada',
    notas               TEXT,

    -- Una solicitud no debería tener dos citas programadas al mismo tiempo
    CONSTRAINT chk_fecha_futura CHECK (fecha_hora > '2020-01-01'::TIMESTAMPTZ)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

-- Búsqueda de mascotas por especie + estado (filtros principales)
CREATE INDEX IF NOT EXISTS idx_mascotas_especie_estado
    ON mascotas (especie, estado);

-- Filtrar solicitudes por estado
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado
    ON solicitudes_adopcion (estado);

-- Buscar expedientes por mascota
CREATE INDEX IF NOT EXISTS idx_expedientes_mascota
    ON expedientes_medicos (id_mascota);

-- Buscar mascotas por publicador
CREATE INDEX IF NOT EXISTS idx_mascotas_publicador
    ON mascotas (id_publicador);

-- Buscar rescates por rescatista
CREATE INDEX IF NOT EXISTS idx_rescates_rescatista
    ON rescates (id_rescatista);

-- Buscar solicitudes por adoptante
CREATE INDEX IF NOT EXISTS idx_solicitudes_adoptante
    ON solicitudes_adopcion (id_adoptante);

-- Buscar solicitudes por mascota
CREATE INDEX IF NOT EXISTS idx_solicitudes_mascota
    ON solicitudes_adopcion (id_mascota);

-- Buscar citas por solicitud
CREATE INDEX IF NOT EXISTS idx_citas_solicitud
    ON citas_adopcion (id_solicitud);

-- Buscar citas programadas futuras
CREATE INDEX IF NOT EXISTS idx_citas_estado
    ON citas_adopcion (estado);

-- Buscar fotos por mascota
CREATE INDEX IF NOT EXISTS idx_fotos_mascota
    ON fotos_mascota (id_mascota);

-- Login rápido por correo
CREATE INDEX IF NOT EXISTS idx_usuarios_correo
    ON usuarios (correo);

-- Buscar usuarios por rol
CREATE INDEX IF NOT EXISTS idx_usuarios_rol
    ON usuarios (rol);

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
