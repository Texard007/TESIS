#!/bin/bash
# ==============================================================================
# Script de Respaldo Automatizado de Base de Datos PostgreSQL
# Plataforma Colaborativa de Adopción de Mascotas
# ==============================================================================

set -euo pipefail

# Configuración de rutas
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/adopcion_mascotas_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

# Cargar variables de entorno
if [ -f "${APP_DIR}/.env" ]; then
    set -a
    source "${APP_DIR}/.env"
    set +a
else
    echo "[ERROR] No se encontró el archivo .env en ${APP_DIR}"
    exit 1
fi

POSTGRES_USER="${POSTGRES_USER:-adopcion_user}"
POSTGRES_DB="${POSTGRES_DB:-adopcion_mascotas}"
CONTAINER_NAME="adopcion-db"

# Crear directorio de respaldos si no existe
mkdir -p "$BACKUP_DIR"

echo "[INFO] Iniciando respaldo de PostgreSQL para la base de datos '$POSTGRES_DB'..."
echo "[INFO] Contenedor destino: $CONTAINER_NAME"
echo "[INFO] Archivo de salida: $BACKUP_FILE"

# Verificar que el contenedor esté corriendo
if ! docker ps --filter "name=${CONTAINER_NAME}" --format '{{.Names}}' | grep -q "${CONTAINER_NAME}"; then
    echo "[ERROR] El contenedor ${CONTAINER_NAME} no está en ejecución. Abortando respaldo."
    exit 1
fi

# Ejecutar pg_dump a través de docker exec y comprimir con gzip al vuelo
docker exec -t "$CONTAINER_NAME" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists | gzip > "$BACKUP_FILE"

# Validar integridad del archivo generado
if [ -s "$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[INFO] Respaldo completado exitosamente. Tamaño: $FILE_SIZE"
else
    echo "[ERROR] El archivo de respaldo se creó vacío. Revisa los logs de PostgreSQL."
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Política de retención: Eliminar respaldos con más de 7 días
echo "[INFO] Aplicando política de retención: conservando los últimos $RETENTION_DAYS días de respaldos..."
find "$BACKUP_DIR" -type f -name "adopcion_mascotas_*.sql.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} \;

echo "[INFO] Respaldos vigentes disponibles:"
ls -lh "$BACKUP_DIR"

# ------------------------------------------------------------------------------
# Nota para Restaurar un Respaldo:
# gunzip -c backups/adopcion_mascotas_YYYYMMDD_HHMMSS.sql.gz | docker exec -i adopcion-db psql -U adopcion_user -d adopcion_mascotas
# ------------------------------------------------------------------------------
