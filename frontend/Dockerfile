# ============================================================
# Frontend Dockerfile – adopcion-mascotas (Expo Web)
# Multi-stage build: compilar con Node → servir con Nginx
# ============================================================

# ---------- Stage 1: Build de la aplicación web ----------
FROM node:20-alpine AS builder

WORKDIR /build

# Copiar manifiestos primero (caché de capas)
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (incluye devDependencies para el build)
RUN npm install --legacy-peer-deps

# Copiar todo el código fuente
COPY . .

# Variable de entorno para la URL del API en producción
ARG API_URL=/api
ENV API_URL=${API_URL}

# Generar build web con Expo
RUN npx expo export --platform web

# ---------- Stage 2: Servir con Nginx ----------
FROM nginx:1.27-alpine AS production

# Metadatos
LABEL maintainer="equipo-adopcion" \
      description="Frontend Web – Plataforma de Adopción de Mascotas"

# Eliminar config default de nginx
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copiar configuración personalizada de nginx para el SPA
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Caché de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback: todas las rutas redirigen a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Desactivar acceso a archivos ocultos
    location ~ /\. {
        deny all;
        return 404;
    }
}
EOF

# Copiar build web desde stage anterior
# Expo 51 exporta a dist/ por defecto
COPY --from=builder /build/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
