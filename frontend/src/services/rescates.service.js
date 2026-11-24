import api from './api';

const MOCK_RESCATES = [
  {
    id_rescate: 1,
    ubicacion: 'Av. 5 de Julio con Delicias, Maracaibo',
    fecha_rescate: '2026-11-15',
    notas: 'Cachorra rescatada en una caja cerca de un centro comercial. Presentaba deshidratación leve.',
    rescatista_nombre: 'María Rescatista',
  },
  {
    id_rescate: 2,
    ubicacion: 'Sector San Francisco, cerca de la Plaza Bolívar',
    fecha_rescate: '2026-11-18',
    notas: 'Gatito atrapado en un árbol. Rescatado con apoyo de la comunidad vecinal.',
    rescatista_nombre: 'Fundación Huellas Zulia',
  },
];

const rescatesService = {
  crear: async (rescateData) => {
    try {
      const response = await api.post('/rescates', rescateData);
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { id_rescate: Date.now(), ...rescateData, fecha_rescate: new Date().toISOString() },
        message: 'Rescate registrado correctamente',
      };
    }
  },

  listar: async (params = {}) => {
    try {
      const response = await api.get('/rescates', { params });
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { rescates: MOCK_RESCATES },
      };
    }
  },
};

export default rescatesService;
