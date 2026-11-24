require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const errorHandler = require('./middlewares/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const mascotasRoutes = require('./routes/mascotas.routes');
const rescatesRoutes = require('./routes/rescates.routes');
const expedientesRoutes = require('./routes/expedientes.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================================
// Global Middleware
// ============================================================

// Security headers
app.use(helmet());

// CORS – configurable origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// ============================================================
// Health Check
// ============================================================

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    message: 'API funcionando correctamente',
  });
});

// ============================================================
// API Routes
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/rescates', rescatesRoutes);
app.use('/api/expedientes', expedientesRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================
// 404 Handler
// ============================================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: 'Ruta no encontrada',
  });
});

// ============================================================
// Centralized Error Handler
// ============================================================

app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  console.log(`🐾 Adopción Mascotas API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
