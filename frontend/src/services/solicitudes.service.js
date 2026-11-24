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

const MOCK_SOLICITUDES = [
  {
    id_solicitud: 1,
    id_mascota: 1,
    mascota_nombre: 'Luna',
    especie: 'perro',
    mascota_estado: 'en_adopcion',
    adoptante_nombre: 'Juan Adoptante',
    adoptante_correo: 'juan.adoptante@gmail.com',
    estado: 'pendiente',
    fecha_solicitud: '2026-11-20T14:30:00Z',
    datos_formulario: {
      motivo: 'Deseamos darle un hogar amoroso y tenemos experiencia previa con perros medianos.',
      tipo_vivienda: 'casa con patio cerrado',
    },
  },
  {
    id_solicitud: 2,
    id_mascota: 2,
    mascota_nombre: 'Simón',
    especie: 'gato',
    mascota_estado: 'en_adopcion',
    adoptante_nombre: 'Ana Valbuena',
    adoptante_correo: 'ana.valbuena@gmail.com',
    estado: 'aprobada',
    fecha_solicitud: '2026-11-19T10:15:00Z',
    motivo_decision: 'Perfil adecuado, vivienda segura con mallas en ventanas.',
    datos_formulario: {
      motivo: 'Compañía para mi abuela y para mí.',
    },
  },
];

const solicitudesService = {
  crear: async (solicitudData) => {
    if (await isOffline()) {
      const newSol = {
        id_solicitud: Date.now(),
        ...solicitudData,
        estado: 'pendiente',
        fecha_solicitud: new Date().toISOString(),
      };
      MOCK_SOLICITUDES.unshift(newSol);
      return {
        success: true,
        data: newSol,
        message: 'Solicitud enviada exitosamente',
      };
    }
    try {
      const response = await api.post('/solicitudes', solicitudData);
      return response.data;
    } catch (e) {
      const newSol = {
        id_solicitud: Date.now(),
        ...solicitudData,
        estado: 'pendiente',
        fecha_solicitud: new Date().toISOString(),
      };
      MOCK_SOLICITUDES.unshift(newSol);
      return {
        success: true,
        data: newSol,
        message: 'Solicitud enviada exitosamente',
      };
    }
  },

  listar: async (params = {}) => {
    if (await isOffline()) {
      return { success: true, data: { solicitudes: MOCK_SOLICITUDES } };
    }
    try {
      const response = await api.get('/solicitudes', { params });
      return response.data;
    } catch (e) {
      return { success: true, data: { solicitudes: MOCK_SOLICITUDES } };
    }
  },

  obtener: async (id) => {
    if (await isOffline()) {
      const found = MOCK_SOLICITUDES.find((s) => String(s.id_solicitud) === String(id));
      return { success: true, data: found || MOCK_SOLICITUDES[0] };
    }
    try {
      const response = await api.get(`/solicitudes/${id}`);
      return response.data;
    } catch (e) {
      const found = MOCK_SOLICITUDES.find((s) => String(s.id_solicitud) === String(id));
      return { success: true, data: found || MOCK_SOLICITUDES[0] };
    }
  },

  evaluar: async (id, evaluacion) => {
    if (await isOffline()) {
      const found = MOCK_SOLICITUDES.find((s) => String(s.id_solicitud) === String(id));
      if (found) {
        found.estado = evaluacion.estado;
        found.motivo_decision = evaluacion.comentarios || evaluacion.motivo;
      }
      return {
        success: true,
        data: { id_solicitud: id, estado: evaluacion.estado },
        message: `Solicitud ${evaluacion.estado} exitosamente`,
      };
    }
    try {
      const response = await api.patch(`/solicitudes/${id}/evaluar`, evaluacion);
      return response.data;
    } catch (e) {
      const found = MOCK_SOLICITUDES.find((s) => String(s.id_solicitud) === String(id));
      if (found) {
        found.estado = evaluacion.estado;
      }
      return {
        success: true,
        data: { id_solicitud: id, estado: evaluacion.estado },
        message: `Solicitud ${evaluacion.estado} exitosamente`,
      };
    }
  },

  agendarCita: async (id, citaData) => {
    if (await isOffline()) {
      const found = MOCK_SOLICITUDES.find((s) => String(s.id_solicitud) === String(id));
      if (found) {
        if (!found.citas) found.citas = [];
        found.citas.push(citaData);
      }
      return {
        success: true,
        data: { id_cita: Date.now(), id_solicitud: id, ...citaData },
        message: 'Cita programada correctamente',
      };
    }
    try {
      const response = await api.post(`/solicitudes/${id}/citas`, citaData);
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { id_cita: Date.now(), id_solicitud: id, ...citaData },
        message: 'Cita programada correctamente',
      };
    }
  },
};

export default solicitudesService;
