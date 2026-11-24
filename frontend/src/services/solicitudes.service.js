import api from './api';

const solicitudesService = {
  /**
   * Crear solicitud de adopción
   * @param {object} solicitudData - { mascotaId, motivo, experiencia, ... }
   * @returns {Promise<{success, data, message}>}
   */
  crear: async (solicitudData) => {
    const response = await api.post('/solicitudes', solicitudData);
    return response.data;
  },

  /**
   * Listar solicitudes (adoptante ve las suyas, rescatista ve las entrantes)
   * @param {object} params - Parámetros opcionales
   * @returns {Promise<{success, data, message}>}
   */
  listar: async (params = {}) => {
    const response = await api.get('/solicitudes', { params });
    return response.data;
  },

  /**
   * Obtener detalle de una solicitud por ID
   * @param {string|number} id
   * @returns {Promise<{success, data, message}>}
   */
  obtener: async (id) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response.data;
  },

  /**
   * Evaluar solicitud (aprobar/rechazar)
   * @param {string} id - ID de la solicitud
   * @param {object} evaluacion - { estado, comentarios }
   * @returns {Promise<{success, data, message}>}
   */
  evaluar: async (id, evaluacion) => {
    const response = await api.patch(`/solicitudes/${id}/evaluar`, evaluacion);
    return response.data;
  },

  /**
   * Agendar cita para una solicitud
   * @param {string} id - ID de la solicitud
   * @param {object} citaData - { fecha, hora, lugar, notas }
   * @returns {Promise<{success, data, message}>}
   */
  agendarCita: async (id, citaData) => {
    const response = await api.post(`/solicitudes/${id}/citas`, citaData);
    return response.data;
  },
};

export default solicitudesService;
