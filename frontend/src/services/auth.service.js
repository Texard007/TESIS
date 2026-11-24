import api from './api';

const authService = {
  /**
   * Iniciar sesión
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success, data, message}>}
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      correo: email,
      email: email,
      password,
    });
    return response.data;
  },

  /**
   * Registrar nuevo usuario
   * @param {object} userData - { nombre, email, password, rol, telefono, ... }
   * @returns {Promise<{success, data, message}>}
   */
  register: async (userData) => {
    const payload = {
      ...userData,
      correo: userData.correo || userData.email,
    };
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  /**
   * Obtener datos del usuario autenticado
   * @returns {Promise<{success, data, message}>}
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
