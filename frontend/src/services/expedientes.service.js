import api from './api';

const expedientesService = {
  /**
   * Obtener expediente médico de una mascota
   * @param {string} mascotaId
   * @returns {Promise<{success, data, message}>}
   */
  obtener: async (mascotaId) => {
    const response = await api.get(`/mascotas/${mascotaId}/expediente`);
    return response.data;
  },

  /**
   * Crear expediente médico para una mascota
   * @param {string} mascotaId
   * @param {object} expedienteData - { diagnostico, tratamiento, vacunas, observaciones, ... }
   * @returns {Promise<{success, data, message}>}
   */
  crear: async (mascotaId, expedienteData) => {
    const response = await api.post(`/mascotas/${mascotaId}/expediente`, expedienteData);
    return response.data;
  },

  /**
   * Actualizar expediente médico
   * @param {string} expedienteId
   * @param {object} expedienteData
   * @returns {Promise<{success, data, message}>}
   */
  actualizar: async (expedienteId, expedienteData) => {
    const response = await api.put(`/expedientes/${expedienteId}`, expedienteData);
    return response.data;
  },
};

export default expedientesService;
