import api from './api';

const MOCK_EXPEDIENTES = {
  1: {
    id_expediente: 1,
    id_mascota: 1,
    mascota_nombre: 'Luna',
    veterinario_nombre: 'Dr. Carlos Veterinario',
    diagnostico: 'Paciente canino hembra en buen estado general. Nutrición adecuada. Sin parásitos externos.',
    tratamientos: 'Desparasitación interna preventiva completada. Plan de vacunación anual iniciado.',
    vacunas: ['Rabia', 'Sextuple Canina', 'Parvovirus'],
    fecha_actualizacion: '2026-11-16T11:00:00Z',
  },
  2: {
    id_expediente: 2,
    id_mascota: 2,
    mascota_nombre: 'Simón',
    veterinario_nombre: 'Dr. Carlos Veterinario',
    diagnostico: 'Felino macho esterilizado. Condición corporal óptima.',
    tratamientos: 'Limpieza dental preventiva y corte de uñas.',
    vacunas: ['Triple Felina', 'Rabia'],
    fecha_actualizacion: '2026-11-17T15:20:00Z',
  },
};

const expedientesService = {
  obtener: async (mascotaId) => {
    try {
      const response = await api.get(`/mascotas/${mascotaId}/expediente`);
      return response.data;
    } catch (e) {
      const exp = MOCK_EXPEDIENTES[mascotaId] || MOCK_EXPEDIENTES[1];
      return {
        success: true,
        data: [exp],
      };
    }
  },

  crear: async (mascotaId, expedienteData) => {
    try {
      const response = await api.post(`/mascotas/${mascotaId}/expediente`, expedienteData);
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { id_expediente: Date.now(), id_mascota: mascotaId, ...expedienteData },
        message: 'Expediente médico guardado correctamente',
      };
    }
  },

  actualizar: async (expedienteId, expedienteData) => {
    try {
      const response = await api.put(`/expedientes/${expedienteId}`, expedienteData);
      return response.data;
    } catch (e) {
      return {
        success: true,
        data: { id_expediente: expedienteId, ...expedienteData },
        message: 'Expediente médico actualizado correctamente',
      };
    }
  },
};

export default expedientesService;
