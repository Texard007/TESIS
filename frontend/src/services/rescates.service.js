import api from './api';

const rescatesService = {
  /**
   * Registrar un nuevo rescate
   * @param {object} rescateData - { descripcion, ubicacion, mascotaId, ... }
   * @returns {Promise<{success, data, message}>}
   */
  crear: async (rescateData) => {
    const response = await api.post('/rescates', rescateData);
    return response.data;
  },

  /**
   * Listar rescates
   * @param {object} params - Parámetros opcionales de filtro
   * @returns {Promise<{success, data, message}>}
   */
  listar: async (params = {}) => {
    const response = await api.get('/rescates', { params });
    return response.data;
  },
};

export default rescatesService;
