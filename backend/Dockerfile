# ============================================================
# Backend Dockerfile – adopcion-mascotas-api
# Multi-stage build para imagen mínima de producción
# ============================================================

# ---------- Stage 1: Instalar dependencias ----------
FROM node:20-alpine AS deps

WORKDIR /build

# Copiar solo manifiestos para aprovechar caché de capas
COPY package.json package-lock.json ./

# Instalar SOLO dependencias de producción
# bcrypt necesita compilación nativa → python3, make, g++
RUN apk add --no-cache python3 make g++ \
    && npm ci --only=production \
    && apk del python3 make g++

# ---------- Stage 2: Imagen de producción ----------
FROM node:20-alpine AS production

# Metadatos
LABEL maintainer="equipo-adopcion" \
      description="API REST – Plataforma de Adopción de Mascotas"

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Crear usuario non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=deps /build/node_modules ./node_modules

# Copiar código fuente y archivos SQL
COPY package.json ./
COPY src/ ./src/
COPY database/ ./database/

# Crear directorio de uploads con permisos correctos
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Cambiar a usuario non-root
USER appuser

# Exponer el puerto de la API
EXPOSE 4000

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Ejecutar con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
