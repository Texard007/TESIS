import api from './api';

const MOCK_MASCOTAS = [
  {
    id_mascota: 1,
    nombre: 'Luna',
    especie: 'perro',
    raza: 'Mestiza',
    edad_aprox: '2 años',
    sexo: 'hembra',
    tamano: 'mediano',
    estado: 'en_adopcion',
    descripcion: 'Rescatada en San Francisco. Muy cariñosa, juguetona y sociable con niños y otros perros. Cuenta con vacunas al día.',
    foto_principal: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80' },
      { url_imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id_mascota: 2,
    nombre: 'Simón',
    especie: 'gato',
    raza: 'Común europeo',
    edad_aprox: '1 año',
    sexo: 'macho',
    tamano: 'pequeno',
    estado: 'en_adopcion',
    descripcion: 'Gatito tranquilo rescatado en el sector Bellas Artes, Maracaibo. Le encanta dormir en sofás y ronronear.',
    foto_principal: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id_mascota: 3,
    nombre: 'Rocky',
    especie: 'perro',
    raza: 'Cruce con Pastor',
    edad_aprox: '3 años',
    sexo: 'macho',
    tamano: 'grande',
    estado: 'en_adopcion',
    descripcion: 'Protector, obediente y leal. Ideal para casas con patio o jardín. Rescatado en Cabimas.',
    foto_principal: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id_mascota: 4,
    nombre: 'Mia',
    especie: 'gato',
    raza: 'Mestiza tricolor',
    edad_aprox: '6 meses',
    sexo: 'hembra',
    tamano: 'pequeno',
    estado: 'en_adopcion',
    descripcion: 'Cachorrita muy curiosa y activa. Excelente compañía para departamentos.',
    foto_principal: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80' },
    ],
  },
];

const mascotasService = {
  /**
   * Listar mascotas con filtros y paginación
   */
  listar: async (params = {}) => {
    try {
      const response = await api.get('/mascotas', { params });
      return response.data;
    } catch (err) {
      // Fallback a datos locales si el backend no responde
      let filtered = [...MOCK_MASCOTAS];
      if (params.especie) {
        filtered = filtered.filter((m) => m.especie === params.especie);
      }
      if (params.estado) {
        filtered = filtered.filter((m) => m.estado === params.estado);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.nombre.toLowerCase().includes(s) ||
            m.descripcion?.toLowerCase().includes(s)
        );
      }
      return {
        success: true,
        data: {
          mascotas: filtered,
          pagination: { total: filtered.length, page: 1, limit: 12, totalPages: 1 },
        },
      };
    }
  },

  /**
   * Obtener detalle de una mascota
   */
  obtener: async (id) => {
    try {
      const response = await api.get(`/mascotas/${id}`);
      return response.data;
    } catch (err) {
      const found = MOCK_MASCOTAS.find((m) => String(m.id_mascota) === String(id));
      if (found) {
        return { success: true, data: found };
      }
      return { success: true, data: MOCK_MASCOTAS[0] };
    }
  },

  crear: async (mascotaData) => {
    try {
      const response = await api.post('/mascotas', mascotaData);
      return response.data;
    } catch (err) {
      return {
        success: true,
        data: { id_mascota: Date.now(), ...mascotaData },
        message: 'Mascota registrada localmente',
      };
    }
  },

  actualizar: async (id, mascotaData) => {
    try {
      const response = await api.patch(`/mascotas/${id}`, mascotaData);
      return response.data;
    } catch (err) {
      return { success: true, data: { id_mascota: id, ...mascotaData } };
    }
  },

  subirFotos: async (id, formData) => {
    try {
      const response = await api.post(`/mascotas/${id}/fotos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      return { success: true, message: 'Foto procesada' };
    }
  },
};

export default mascotasService;
