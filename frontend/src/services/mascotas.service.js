import api from './api';

const mascotasService = {
  /**
   * Listar mascotas con filtros y paginación
   * @param {object} params - { especie, estado, search, page, limit }
   * @returns {Promise<{success, data, message}>}
   */
  listar: async (params = {}) => {
    const response = await api.get('/mascotas', { params });
    return response.data;
  },

  /**
   * Obtener detalle de una mascota
   * @param {string} id
   * @returns {Promise<{success, data, message}>}
   */
  obtener: async (id) => {
    const response = await api.get(`/mascotas/${id}`);
    return response.data;
  },

  /**
   * Crear nueva mascota
   * @param {object} mascotaData - { nombre, especie, raza, edad, descripcion, estado, ... }
   * @returns {Promise<{success, data, message}>}
   */
  crear: async (mascotaData) => {
    const response = await api.post('/mascotas', mascotaData);
    return response.data;
  },

  /**
   * Actualizar mascota
   * @param {string} id
   * @param {object} mascotaData
   * @returns {Promise<{success, data, message}>}
   */
  actualizar: async (id, mascotaData) => {
    const response = await api.patch(`/mascotas/${id}`, mascotaData);
    return response.data;
  },

  /**
   * Subir fotos de una mascota
   * @param {string} id - ID de la mascota
   * @param {FormData} formData - FormData con la(s) foto(s)
   * @returns {Promise<{success, data, message}>}
   */
  subirFotos: async (id, formData) => {
    const response = await api.post(`/mascotas/${id}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default mascotasService;
