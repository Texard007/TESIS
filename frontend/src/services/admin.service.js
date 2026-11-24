import api from './api';

const MOCK_REPORTES = {
  usuarios: {
    total: 24,
    por_rol: {
      adoptante: 16,
      rescatista: 4,
      veterinario: 3,
      administrador: 1,
    },
  },
  mascotas: {
    total: 18,
    por_estado: {
      en_adopcion: 10,
      en_rescate: 3,
      en_proceso: 2,
      adoptada: 3,
    },
  },
  solicitudes: {
    por_estado: {
      pendiente: 5,
      en_revision: 2,
      aprobada: 3,
      rechazada: 1,
    },
  },
  rescates: {
    total: 12,
  },
};

const MOCK_USUARIOS = [
  { id_usuario: 1, nombre: 'Admin General', correo: 'admin@adopcionzulia.org', rol: 'administrador', estado: 'activo' },
  { id_usuario: 2, nombre: 'Dr. Carlos Veterinario', correo: 'vet.carlos@veterinariazulia.com', rol: 'veterinario', estado: 'activo' },
  { id_usuario: 3, nombre: 'María Rescatista', correo: 'maria.rescatista@fundacionhuellas.org', rol: 'rescatista', estado: 'activo' },
  { id_usuario: 4, nombre: 'Juan Adoptante', correo: 'juan.adoptante@gmail.com', rol: 'adoptante', estado: 'activo' },
];

const adminService = {
  obtenerReportes: async (params = {}) => {
    try {
      const response = await api.get('/admin/reportes', { params });
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: MOCK_REPORTES,
      };
    }
  },

  listarUsuarios: async (params = {}) => {
    try {
      const response = await api.get('/admin/usuarios', { params });
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { usuarios: MOCK_USUARIOS, pagination: { total: MOCK_USUARIOS.length, page: 1 } },
      };
    }
  },

  cambiarEstadoUsuario: async (userId, estadoData) => {
    try {
      const response = await api.patch(`/admin/usuarios/${userId}/estado`, estadoData);
      return response.data;
    } catch (e) {
      return {
        success: true,
        message: `Estado actualizado a ${estadoData.estado}`,
      };
    }
  },
};

export default adminService;
