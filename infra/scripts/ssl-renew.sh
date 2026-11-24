#!/bin/bash
# ==============================================================================
# Script de Renovación Automática de Certificados SSL (Let's Encrypt / Certbot)
# Plataforma Colaborativa de Adopción de Mascotas
# ==============================================================================

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_TAG="[SSL-RENEW]"

echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG Iniciando verificación de renovación de certificados..."

# Ejecutar renovación con certbot usando el webroot compartido
if certbot renew --webroot -w /var/www/certbot --quiet --no-self-upgrade; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG Certificados verificados y/o renovados."
    
    # Recargar Nginx dentro del contenedor Docker para aplicar el nuevo certificado
    if docker ps --filter "name=adopcion-nginx" --format '{{.Names}}' | grep -q "adopcion-nginx"; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG Recargando configuración de Nginx en contenedor..."
        docker exec adopcion-nginx nginx -s reload
        echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG Nginx recargado correctamente."
    else
        echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG El contenedor adopcion-nginx no está en ejecución. Omitiendo recarga."
    fi
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG [ERROR] Falló la renovación de certificados Certbot."
    exit 1
fi
