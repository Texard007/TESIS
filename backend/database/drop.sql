-- ============================================================
-- Drop Script: Plataforma de Adopción de Mascotas
-- Elimina todas las tablas y tipos en orden correcto
-- (respetando dependencias de foreign keys)
-- ============================================================

-- 1. Tablas (orden inverso de dependencias)
DROP TABLE IF EXISTS citas_adopcion        CASCADE;
DROP TABLE IF EXISTS solicitudes_adopcion   CASCADE;
DROP TABLE IF EXISTS expedientes_medicos    CASCADE;
DROP TABLE IF EXISTS fotos_mascota         CASCADE;
DROP TABLE IF EXISTS mascotas              CASCADE;
DROP TABLE IF EXISTS rescates              CASCADE;
DROP TABLE IF EXISTS perfiles_administrador CASCADE;
DROP TABLE IF EXISTS perfiles_veterinario   CASCADE;
DROP TABLE IF EXISTS perfiles_rescatista    CASCADE;
DROP TABLE IF EXISTS perfiles_adoptante     CASCADE;
DROP TABLE IF EXISTS usuarios              CASCADE;

-- 2. ENUM types
DROP TYPE IF EXISTS estado_cita       CASCADE;
DROP TYPE IF EXISTS estado_solicitud  CASCADE;
DROP TYPE IF EXISTS estado_mascota    CASCADE;
DROP TYPE IF EXISTS estado_usuario    CASCADE;
DROP TYPE IF EXISTS rol_usuario       CASCADE;
DROP TYPE IF EXISTS tipo_vivienda     CASCADE;
DROP TYPE IF EXISTS especie_mascota   CASCADE;
DROP TYPE IF EXISTS sexo_mascota      CASCADE;
DROP TYPE IF EXISTS tamano_mascota    CASCADE;

-- ============================================================
-- FIN DEL DROP
-- ============================================================
