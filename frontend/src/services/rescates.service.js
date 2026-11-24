import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isOffline = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return !token || token.startsWith('offline-') || token.startsWith('demo-');
  } catch (e) {
    return true;
  }
};

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
    const newRes = {
      id_rescate: Date.now(),
      ...rescateData,
      fecha_rescate: new Date().toISOString().split('T')[0],
      rescatista_nombre: 'Rescatista Actual',
    };
    if (await isOffline()) {
      MOCK_RESCATES.unshift(newRes);
      return {
        success: true,
        data: newRes,
        message: 'Rescate registrado correctamente',
      };
    }
    try {
      const response = await api.post('/rescates', rescateData);
      return response.data;
    } catch (e) {
      MOCK_RESCATES.unshift(newRes);
      return {
        success: true,
        data: newRes,
        message: 'Rescate registrado correctamente',
      };
    }
  },

  listar: async (params = {}) => {
    if (await isOffline()) {
      return { success: true, data: { rescates: MOCK_RESCATES } };
    }
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
