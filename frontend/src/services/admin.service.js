import api from './api';

const adminService = {
  /**
   * Obtener reportes del administrador
   * @param {object} params - Parámetros opcionales de filtro
   * @returns {Promise<{success, data, message}>}
   */
  obtenerReportes: async (params = {}) => {
    const response = await api.get('/admin/reportes', { params });
    return response.data;
  },

  /**
   * Listar todos los usuarios
   * @param {object} params - Parámetros de filtro y paginación
   * @returns {Promise<{success, data, message}>}
   */
  listarUsuarios: async (params = {}) => {
    const response = await api.get('/admin/usuarios', { params });
    return response.data;
  },

  /**
   * Cambiar estado de un usuario (activar/desactivar/bloquear)
   * @param {string} userId
   * @param {object} estadoData - { estado }
   * @returns {Promise<{success, data, message}>}
   */
  cambiarEstadoUsuario: async (userId, estadoData) => {
    const response = await api.patch(`/admin/usuarios/${userId}/estado`, estadoData);
    return response.data;
  },
};

export default adminService;
