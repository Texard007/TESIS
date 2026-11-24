#!/bin/bash
# ==============================================================================
# Script de Despliegue Automatizado en VPS Linux (Ubuntu / Debian)
# Plataforma Colaborativa de Adopción de Mascotas - Estado Zulia
# ==============================================================================

set -euo pipefail

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Comprobar permisos de root
if [ "$EUID" -ne 0 ]; then
    log_error "Este script debe ejecutarse como root o con sudo."
    exit 1
fi

log_info "Iniciando despliegue de la Plataforma de Adopción de Mascotas..."

# 2. Actualizar sistema e instalar dependencias básicas
log_info "Actualizando repositorios del sistema e instalando dependencias básicas..."
apt-get update -y
apt-get install -y curl git ufw ca-certificates gnupg lsb-release certbot

# 3. Instalar Docker y Docker Compose si no existen
if ! command -v docker &> /dev/null; then
    log_info "Docker no está instalado. Procediendo con la instalación oficial..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    log_info "Docker instalado correctamente."
else
    log_info "Docker ya se encuentra instalado."
fi

# 4. Configurar Firewall (UFW)
log_info "Configurando reglas de firewall (UFW)..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 5. Directorio de la aplicación
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$APP_DIR"
log_info "Directorio del proyecto: $APP_DIR"

# 6. Configuración de variables de entorno (.env)
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        log_warn "Archivo .env no encontrado. Copiando desde .env.example..."
        cp .env.example .env
        log_warn "IMPORTANTE: Edita el archivo .env con credenciales reales antes de continuar en producción."
    else
        log_error "No se encontró .env ni .env.example. Abortando."
        exit 1
    fi
fi

# Cargar variables del .env
set -a
source .env
set +a

# Validar variables esenciales
DOMAIN="${DOMAIN:-tudominio.com}"
EMAIL="${EMAIL:-admin@tudominio.com}"

log_info "Dominio configurado: $DOMAIN"
log_info "Correo para Let's Encrypt: $EMAIL"

# 7. Reemplazar dominio en configuraciones de Nginx
log_info "Ajustando server_name en archivos de Nginx..."
sed -i "s/yourdomain.com/$DOMAIN/g" infra/nginx/nginx.conf
sed -i "s/yourdomain.com/$DOMAIN/g" infra/nginx/nginx-initial.conf

# 8. Creación de directorios para Certbot y certificados
mkdir -p /etc/letsencrypt
mkdir -p /var/www/certbot
mkdir -p infra/nginx/conf.d

# 9. Fase de Obtención de Certificado SSL (Let's Encrypt)
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    log_info "No se detectó certificado SSL para $DOMAIN. Procediendo con emisión inicial..."
    
    # Usar configuración HTTP-only provisional
    cp infra/nginx/nginx-initial.conf infra/nginx/active-nginx.conf
    sed -i 's|./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro|./infra/nginx/active-nginx.conf:/etc/nginx/nginx.conf:ro|g' docker-compose.yml

    # Levantar temporalmente el servicio web y nginx para validar ACME challenge
    docker compose up -d web nginx

    log_info "Solicitando certificado a Let's Encrypt vía Certbot (webroot)..."
    certbot certonly --webroot -w /var/www/certbot \
        -d "$DOMAIN" -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos --non-interactive \
        --no-eff-email || {
            log_warn "Fallo en Certbot (posiblemente DNS no propagado o entorno local)."
            log_warn "Generando certificado autofirmado provisional para pruebas..."
            mkdir -p "/etc/letsencrypt/live/$DOMAIN"
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout "/etc/letsencrypt/live/$DOMAIN/privkey.pem" \
                -out "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" \
                -subj "/CN=$DOMAIN"
            cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "/etc/letsencrypt/live/$DOMAIN/chain.pem"
        }

    # Restaurar configuración principal de Nginx con SSL completo
    sed -i 's|./infra/nginx/active-nginx.conf:/etc/nginx/nginx.conf:ro|./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro|g' docker-compose.yml
    rm -f infra/nginx/active-nginx.conf
fi

# 10. Construcción y levantamiento de la aplicación completa
log_info "Construyendo y levantando los contenedores de producción..."
docker compose down --remove-orphans || true
docker compose build --pull
docker compose up -d

# 11. Esperar healthcheck de PostgreSQL e inicializar esquema si es necesario
log_info "Esperando disponibilidad de la base de datos PostgreSQL..."
sleep 10
until docker compose exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
    log_warn "PostgreSQL aún no está listo, esperando 5 segundos..."
    sleep 5
done

log_info "Verificando inicialización de la base de datos..."
# La imagen postgres:16-alpine ejecuta automáticamente los scripts en /docker-entrypoint-initdb.d/
# al arrancar por primera vez si el volumen está vacío.
# Si se desea forzar o reejecutar:
# docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/01-schema.sql

# 12. Configurar tarea cron para renovación automática de SSL
log_info "Configurando tarea programada (cron) para renovación de SSL..."
CRON_JOB="0 3 * * * $APP_DIR/infra/scripts/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1"
(crontab -l 2>/dev/null | grep -Fv "ssl-renew.sh" ; echo "$CRON_JOB") | crontab -

# 13. Verificación de estado final
log_info "Comprobando estado de los servicios..."
docker compose ps

log_info "======================================================================"
log_info "¡Despliegue completado con éxito!"
log_info "Plataforma disponible en: https://$DOMAIN"
log_info "API Health Check: https://$DOMAIN/api/health"
log_info "======================================================================"
