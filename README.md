# Plataforma Colaborativa de Apoyo en Comunidades de Adopción de Mascotas 🐾
### Estado Zulia, Venezuela

Sistema integral multiplataforma diseñado para conectar y coordinar a **fundaciones, rescatistas independientes, médicos veterinarios y adoptantes**, facilitando el proceso de rescate, atención médica integral, publicación, solicitud y seguimiento de adopciones responsables.

---

## 📋 Tabla de Contenidos
1. [Actores del Sistema y Funcionalidades](#1-actores-del-sistema-y-funcionalidades)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Modelo de Base de Datos Relacional](#4-modelo-de-base-de-datos-relacional)
5. [Endpoints de la API REST](#5-endpoints-de-la-api-rest)
6. [Reglas de Negocio y Seguridad (RNF01–RNF04)](#6-reglas-de-negocio-y-seguridad-rnf01rnf04)
7. [Prerrequisitos de Instalación](#7-prerrequisitos-de-instalación)
8. [Inicio Rápido para Desarrollo Local](#8-inicio-rápido-para-desarrollo-local)
9. [Guía de Despliegue en Producción (VPS Linux + Docker + SSL)](#9-guía-de-despliegue-en-producción-vps-linux--docker--ssl)
10. [Procedimiento de Respaldo y Restauración de Base de Datos](#10-procedimiento-de-respaldo-y-restauración-de-base-de-datos)
11. [Variables de Entorno](#11-variables-de-entorno)

---

## 1. Actores del Sistema y Funcionalidades

| Rol | Responsabilidades y Flujos Principales |
| :--- | :--- |
| **🐶 Adoptante** | • Registro y perfil socioeconómico (`ingresos_aproximados`, tipo de vivienda, jardín).<br>• Catálogo visual con filtros avanzados (especie, tamaño, sexo, estado) y búsqueda de texto.<br>• Envío del formulario de solicitud de adopción.<br>• Agendamiento y confirmación de citas de interacción (`<<extend>>` de solicitud). |
| **🚑 Rescatista** | • Registro de rescates geolocalizados (`id_rescate`, `ubicacion`, fecha, notas).<br>• Publicación de fichas de adopción con carga múltiple de fotografías (`<<include>>`).<br>• Bandeja de solicitudes entrantes: evaluación, aprobación o rechazo con motivo.<br>• Cierre de adopción con actualización automática de estado a `adoptada`. |
| **🩺 Veterinario** | • Creación y actualización de expedientes médicos (`vacunas` en JSONB, diagnósticos, tratamientos clínicos).<br>• Consulta de historiales clínicos vinculados a cada mascota.<br>• Registro directo de mascotas rescatadas con requerimientos médicos. |
| **👑 Administrador** | • Panel de métricas globales y generación de reportes consolidados.<br>• Gestión y moderación de usuarios (activación, suspensión o desactivación).<br>• Supervisión general de publicaciones y auditoría de solicitudes. |

---

## 2. Arquitectura del Sistema

```
                   [ Internet / Clientes ]
                             │
                  (HTTPS :443 / HTTP :80)
                             ▼
         ┌───────────────────────────────────────┐
         │     Nginx Reverse Proxy & SSL/TLS     │
         │      (Let's Encrypt / Rate Limit)     │
         └───────┬───────────────────────┬───────┘
                 │ /api                  │ /
                 ▼                       ▼
    ┌────────────────────────┐  ┌────────────────────────┐
    │     Backend API        │  │      Frontend Web      │
    │  Node.js 20 + Express  │  │  React Native / Expo   │
    │     (Puerto 4000)      │  │      Nginx (SPA)       │
    └────────────┬───────────┘  └────────────────────────┘
                 │
                 ▼ (Red Interna Docker)
    ┌────────────────────────┐
    │  PostgreSQL 16 Alpine  │
    │   (Base de Datos)      │
    └────────────────────────┘
```

---

## 3. Estructura del Proyecto

```
Proyecto ING SOFTWARE 2/
├── .env.example                  # Plantilla de variables de entorno
├── docker-compose.yml            # Orquestación de servicios en contenedores
├── README.md                     # Documentación general en español
│
├── backend/                      # API REST en Node.js + Express
│   ├── Dockerfile                # Multi-stage build optimizado
│   ├── .dockerignore
│   ├── package.json
│   ├── database/
│   │   ├── schema.sql            # Tablas, ENUMs, índices y restricciones CHECK
│   │   ├── seed.sql              # Semillas de prueba (Zulia, contraseñas hash)
│   │   └── drop.sql              # Script idempotente para reiniciar esquema
│   ├── uploads/                  # Directorio local de fotografías
│   └── src/
│       ├── index.js              # Servidor Express y middleware global
│       ├── config/               # Conexión pg Pool y configuración JWT
│       ├── controllers/          # Controladores (auth, mascotas, solicitudes, etc.)
│       ├── middlewares/          # Auth RBAC, upload Multer, errorHandler
│       ├── routes/               # Enrutamiento modular RESTful
│       ├── services/             # Lógica de negocio y transacciones SQL
│       └── validators/           # Validaciones con express-validator
│
├── frontend/                     # Aplicación Multiplataforma (Expo SDK 51)
│   ├── Dockerfile                # Compilación Expo web + servidor Nginx
│   ├── .dockerignore
│   ├── package.json
│   ├── app.json                  # Configuración de Expo
│   ├── babel.config.js
│   ├── assets/                   # Iconos e imágenes del sistema
│   ├── app/                      # Enrutamiento basado en archivos (Expo Router)
│   │   ├── _layout.js            # Contenedor global de temas y auth
│   │   ├── index.js              # Redirección según sesión
│   │   ├── (auth)/               # Pantallas de Login y Registro por rol
│   │   └── (tabs)/               # Pestañas adaptativas según rol del usuario
│   │       ├── mascotas/         # Catálogo y detalle de mascota
│   │       ├── rescates/         # Flujo de rescates para rescatistas
│   │       ├── solicitudes/      # Gestión de solicitudes y citas
│   │       ├── expedientes/      # Historial médico para veterinarios
│   │       ├── admin/            # Panel administrativo y usuarios
│   │       └── perfil/           # Edición de perfil socioeconómico
│   └── src/
│       ├── components/           # Componentes UI reutilizables
│       ├── constants/            # Colores temáticos y URLs
│       ├── contexts/             # AuthContext con almacenamiento seguro
│       ├── hooks/                # Custom hook useAuth
│       └── services/             # Clientes Axios con interceptores JWT
│
└── infra/                        # Infraestructura y scripts operativos
    ├── nginx/
    │   ├── nginx.conf            # Proxy inverso con TLS 1.2/1.3, CSP y Rate Limit
    │   └── nginx-initial.conf    # Configuración HTTP para obtención de certificados
    └── scripts/
        ├── deploy.sh             # Despliegue automatizado en VPS Ubuntu/Debian
        ├── backup.sh             # Respaldo con retención de 7 días
        └── ssl-renew.sh          # Tarea cron para renovar Let's Encrypt
```

---

## 4. Modelo de Base de Datos Relacional

La base de datos relacional PostgreSQL 16 implementa las siguientes entidades:

1. **`usuarios`**: Clave primaria `id_usuario`, correo único, hash `bcrypt`, teléfono, rol (`administrador`, `veterinario`, `rescatista`, `adoptante`), estado (`activo`, `inactivo`, `suspendido`), intentos fallidos acumulados y marca temporal `bloqueado_hasta`.
2. **`perfiles_adoptante`**: Clave foránea 1:1 con `usuarios`, almacena `ingresos_aproximados`, tipo de vivienda (`casa`, `apartamento`, `quinta`, `otro`) y tenencia de jardín.
3. **`perfiles_rescatista`**: Datos organizacionales y zona geográfica de cobertura en el estado Zulia.
4. **`perfiles_veterinario`**: Número único de matrícula/licencia profesional y clínica asociada.
5. **`perfiles_administrador`**: Nivel de acceso jerárquico (1 a 3).
6. **`rescates`**: Registro de rescates con fecha, ubicación detallada y notas de campo.
7. **`mascotas`**: Ficha técnica con especie (`perro`, `gato`, `conejo`, `ave`, `otro`), estado (`en_rescate`, `en_adopcion`, `en_proceso`, `adoptada`), edad aproximada, sexo y tamaño.
8. **`fotos_mascota`**: Galería de imágenes vinculada a cada mascota con indicador de foto principal.
9. **`expedientes_medicos`**: Registro clínico con campo `vacunas` (JSONB), diagnóstico clínico, tratamientos indicados y fecha de última actualización médica.
10. **`solicitudes_adopcion`**: Formulario de adopción en formato JSONB con restricción única activa `(id_mascota, id_adoptante)` para evitar duplicidades.
11. **`citas_adopcion`**: Agenda de citas para interacción presencial entre el adoptante y la mascota.

### Índices de Alto Rendimiento
- `mascotas(especie, estado)`: Optimiza la consulta y filtrado del catálogo de adopciones.
- `solicitudes_adopcion(estado)`: Agiliza las bandejas de trabajo de rescatistas.
- `expedientes_medicos(id_mascota)`: Acceso instantáneo al historial clínico veterinario.

---

## 5. Endpoints de la API REST

Base URL: `/api`  
Formato de respuesta estándar: `{ "success": boolean, "data": any, "message": string }`

### Autenticación y Perfil
| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registro de usuarios y creación del perfil específico del rol. |
| `POST` | `/api/auth/login` | Público | Login con bloqueo tras 3 intentos fallidos consecutivos. |
| `GET` | `/api/auth/me` | Autenticado | Devuelve los datos del usuario en sesión y su perfil asociado. |

### Mascotas
| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/mascotas` | Público | Lista paginada con filtros por `especie`, `estado`, `tamano` y búsqueda textual. |
| `GET` | `/api/mascotas/:id` | Público | Detalle completo de la mascota con su galería fotográfica. |
| `POST` | `/api/mascotas` | Rescatista, Veterinario, Admin | Publicación de una nueva ficha de mascota. |
| `PATCH` | `/api/mascotas/:id` | Rescatista, Veterinario, Admin | Actualización parcial de los datos de la mascota. |
| `DELETE` | `/api/mascotas/:id` | Rescatista, Admin | Baja lógica o eliminación de publicación. |
| `POST` | `/api/mascotas/:id/fotos` | Rescatista, Veterinario, Admin | Subida multipart/form-data de imágenes fotográficas. |

### Rescates
| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/rescates` | Rescatista | Registro de rescate geolocalizado en el estado Zulia. |
| `GET` | `/api/rescates` | Rescatista, Admin | Lista de rescates (el rescatista ve los propios; admin ve todos). |
| `GET` | `/api/rescates/:id` | Rescatista, Admin | Consulta del detalle de un rescate específico. |

### Expedientes Médicos
| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/mascotas/:id/expediente` | Autenticado | Consulta del historial clínico de una mascota. |
| `POST` | `/api/mascotas/:id/expediente`| Veterinario, Admin | Creación de expediente médico asociado a una mascota. |
| `PUT` | `/api/expedientes/:id` | Veterinario, Admin | Actualización de vacunas, diagnósticos y tratamientos. |

### Solicitudes y Citas de Adopción
| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/solicitudes` | Adoptante | Envío de formulario de solicitud de adopción. |
| `GET` | `/api/solicitudes` | Adoptante, Rescatista, Admin | Lista de solicitudes (filtradas según el rol del usuario). |
| `GET` | `/api/solicitudes/:id` | Adoptante, Rescatista, Admin | Detalle de la solicitud de adopción. |
| `PATCH` | `/api/solicitudes/:id/evaluar` | Rescatista, Admin | Aprobar o rechazar. Si se aprueba, la mascota pasa a `adoptada`. |
| `POST` | `/api/solicitudes/:id/citas` | Adoptante, Rescatista, Admin | Agendar cita presencial para la solicitud en curso. |

### Administración y Monitoreo
| Método | Endpoint | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/reportes` | Administrador | Estadísticas consolidadas (usuarios por rol, mascotas por estado). |
| `GET` | `/api/admin/usuarios` | Administrador | Listado completo de usuarios registrados con paginación. |
| `PATCH`| `/api/admin/usuarios/:id/estado`| Administrador | Activar, inactivar o suspender cuentas de usuario. |
| `GET` | `/api/health` | Público | Chequeo de salud del servicio (uptime y disponibilidad de API). |

---

## 6. Reglas de Negocio y Seguridad (RNF01–RNF04)

- **Control de Intentos de Login:** El sistema registra cada intento fallido de contraseña. Al tercer intento consecutivo erróneo, la cuenta es bloqueada automáticamente durante 15 minutos (`bloqueado_hasta = NOW() + 15 min`).
- **Seguridad en Cabeceras:** Inclusión de `helmet` en backend y cabeceras estrictas en Nginx: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` y `Content-Security-Policy`.
- **Límite de Peticiones (Rate Limiting):** Nginx aplica zona de rate limit a 30 req/s para `/api/` y restricción adicional a 5 req/min para `/api/auth/login` mitigando ataques de fuerza bruta.
- **Validación Estricta:** Middleware de validación con `express-validator` en todas las rutas de entrada.
- **Transiciones de Estado de Mascota:** La aprobación formal de una adopción actualiza de manera transaccional el estado de la mascota a `adoptada`, previniendo dobles asignaciones.

---

## 7. Prerrequisitos de Instalación

- **Docker:** Versión 24.0 o superior ([Instrucciones de instalación](https://docs.docker.com/engine/install/))
- **Docker Compose:** Plugin v2.20 o superior
- **Node.js (opcional para desarrollo sin Docker):** v20.x LTS o superior con npm
- **Git:** Para clonar el repositorio

---

## 8. Inicio Rápido para Desarrollo Local

### Opción A: Con Docker Compose (Recomendado)

1. Clonar el repositorio y acceder a la carpeta del proyecto:
   ```bash
   cd "Proyecto ING SOFTWARE 2"
   ```

2. Crear el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

3. Levantar los servicios con Docker Compose:
   ```bash
   docker compose up --build
   ```

4. Acceso a los servicios:
   - **Frontend Web:** `http://localhost`
   - **Backend API:** `http://localhost:4000/api`
   - **Health Check:** `http://localhost:4000/api/health`

### Usuarios de Prueba Semilla (Password común: `Password123!`)
- **Administrador:** `admin@adopcionzulia.org`
- **Veterinario:** `vet.carlos@veterinariazulia.com`
- **Rescatista:** `maria.rescatista@fundacionhuellas.org`
- **Adoptante:** `juan.adoptante@gmail.com`

---

## 9. Guía de Despliegue en Producción (VPS Linux + Docker + SSL)

### Paso 1: Configurar el Servidor VPS (Ubuntu 22.04 / 24.04 LTS)
Conectarse al servidor vía SSH:
```bash
ssh root@IP_DE_TU_VPS
```

### Paso 2: Clonar el Repositorio
```bash
cd /opt
git clone <URL_DEL_REPOSITORIO> adopcion-mascotas
cd adopcion-mascotas
```

### Paso 3: Configurar Variables de Entorno
```bash
cp .env.example .env
nano .env
```
Asegurar colocar:
- `DOMAIN=tudominio.com`
- `EMAIL=tu-correo@tudominio.com`
- `POSTGRES_PASSWORD=una_contraseña_muy_segura`
- `JWT_SECRET=$(openssl rand -base64 48)`

### Paso 4: Ejecutar el Script de Despliegue Automatizado
El script `infra/scripts/deploy.sh` realiza la instalación de Docker, apertura de puertos UFW, configuración inicial de Nginx, emisión de certificados Let's Encrypt y arranque de contenedores:
```bash
chmod +x infra/scripts/*.sh
sudo ./infra/scripts/deploy.sh
```

### Paso 5: Verificación de Estado y Logs
```bash
# Ver estado de los contenedores
docker compose ps

# Inspeccionar logs en tiempo real
docker compose logs -f api
docker compose logs -f nginx
```

---

## 10. Procedimiento de Respaldo y Restauración de Base de Datos

### Generar un Respaldo Manual
Ejecutar el script automatizado (comprime en gzip y aplica retención de 7 días):
```bash
sudo ./infra/scripts/backup.sh
```
Los respaldos se almacenan en el directorio `./backups/` con el formato `adopcion_mascotas_YYYYMMDD_HHMMSS.sql.gz`.

### Restaurar un Respaldo Específico
Para restaurar una copia de seguridad en la base de datos de producción:
```bash
gunzip -c backups/adopcion_mascotas_YYYYMMDD_HHMMSS.sql.gz | docker exec -i adopcion-db psql -U adopcion_user -d adopcion_mascotas
```

---

## 11. Variables de Entorno

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `POSTGRES_USER` | Usuario de PostgreSQL | `adopcion_user` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | Requerido en producción |
| `POSTGRES_DB` | Nombre de la base de datos | `adopcion_mascotas` |
| `DATABASE_URL` | String de conexión a Postgres | `postgresql://...` |
| `NODE_ENV` | Entorno de Node.js | `production` / `development` |
| `PORT` | Puerto interno del servidor Express | `4000` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | Requerido en producción |
| `JWT_EXPIRES_IN` | Tiempo de vida del token de acceso | `24h` |
| `CORS_ORIGIN` | Origen permitido para solicitudes web | `https://tudominio.com` o `*` |
| `DOMAIN` | Dominio asignado al VPS | `tudominio.com` |
| `EMAIL` | Correo de registro para Let's Encrypt | `admin@tudominio.com` |

---

### Licencia y Créditos
Desarrollado para el proyecto de Ingeniería de Software II. Enfoque social y humanitario para el bienestar animal y la gestión colaborativa en el estado Zulia.
