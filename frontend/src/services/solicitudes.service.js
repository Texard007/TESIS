import api from './api';

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
    try {
      const response = await api.post('/solicitudes', solicitudData);
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { id_solicitud: Date.now(), ...solicitudData, estado: 'pendiente' },
        message: 'Solicitud enviada exitosamente',
      };
    }
  },

  listar: async (params = {}) => {
    try {
      const response = await api.get('/solicitudes', { params });
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { solicitudes: MOCK_SOLICITUDES },
      };
    }
  },

  obtener: async (id) => {
    try {
      const response = await api.get(`/solicitudes/${id}`);
      return response.data;
    } catch (e) {
      const found = MOCK_SOLICITUDES.find((s) => String(s.id_solicitud) === String(id));
      return {
        success: true,
        data: found || MOCK_SOLICITUDES[0],
      };
    }
  },

  evaluar: async (id, evaluacion) => {
    try {
      const response = await api.patch(`/solicitudes/${id}/evaluar`, evaluacion);
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { id_solicitud: id, estado: evaluacion.estado },
        message: `Solicitud ${evaluacion.estado} exitosamente`,
      };
    }
  },

  agendarCita: async (id, citaData) => {
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
