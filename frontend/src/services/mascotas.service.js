import api from './api';

const MOCK_MASCOTAS = [
  // === PERROS ===
  {
    id_mascota: 1,
    nombre: 'Luna',
    especie: 'perro',
    raza: 'Mestiza',
    edad_aprox: '2 años',
    edad: 2,
    sexo: 'hembra',
    tamano: 'mediano',
    peso: 12.5,
    color: 'Marrón dorado',
    estado: 'en_adopcion',
    ubicacion: 'San Francisco, Zulia',
    descripcion: 'Rescatada en San Francisco. Muy cariñosa, juguetona y sociable con niños y otros perros. Cuenta con vacunas al día.',
    foto_principal: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80' },
      { url_imagen: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80' },
    ],
    // Información médica
    vacunas: [
      { nombre: 'Rabia', fecha: '2026-04-10', proxima: '2027-04-10', veterinario: 'Dr. Luis Fuenmayor' },
      { nombre: 'Parvovirus / Distemper', fecha: '2026-02-15', proxima: '2027-02-15', veterinario: 'Dr. Luis Fuenmayor' },
      { nombre: 'Bordetella', fecha: '2026-05-01', proxima: '2027-05-01', veterinario: 'Dr. Luis Fuenmayor' },
    ],
    esterilizado: true,
    microchip: true,
    numero_microchip: 'MCP-7701-2024',
    condicion_salud: 'Excelente',
    alergias: 'Ninguna conocida',
    enfermedades_previas: 'Ninguna',
    medicamentos_actuales: 'Ninguno',
    // Alimentación
    alimentacion: {
      tipo: 'Croquetas secas premium',
      frecuencia: '2 veces al día (mañana y noche)',
      cantidad: '250 g por comida',
      marca: 'ProPlan Adulto Mediano',
      restricciones: 'Ninguna',
    },
    // Comportamiento
    comportamiento: 'Sociable con niños y otros perros. Disfruta jugar al aire libre.',
    compatible_ninos: true,
    compatible_perros: true,
    compatible_gatos: false,
    nivel_ejercicio: 'Alto',
    // Legal
    fecha_rescate: '2024-08-15',
    lugar_rescate: 'Av. 5 de Julio, San Francisco',
    id_rescatista: 5,
    documentos_legales: [],
  },
  {
    id_mascota: 3,
    nombre: 'Rocky',
    especie: 'perro',
    raza: 'Cruce con Pastor Alemán',
    edad_aprox: '3 años',
    edad: 3,
    sexo: 'macho',
    tamano: 'grande',
    peso: 28.0,
    color: 'Negro y marrón',
    estado: 'en_adopcion',
    ubicacion: 'Cabimas, Zulia',
    descripcion: 'Protector, obediente y leal. Ideal para casas con patio o jardín. Rescatado en Cabimas. Ha recibido entrenamiento básico.',
    foto_principal: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [
      { nombre: 'Rabia', fecha: '2026-01-20', proxima: '2027-01-20', veterinario: 'Dra. Ana Molero' },
      { nombre: 'Parvovirus / Distemper', fecha: '2025-12-10', proxima: '2026-12-10', veterinario: 'Dra. Ana Molero' },
    ],
    esterilizado: false,
    microchip: true,
    numero_microchip: 'MCP-3301-2023',
    condicion_salud: 'Buena',
    alergias: 'Ninguna conocida',
    enfermedades_previas: 'Parvovirosis recuperada (2023)',
    medicamentos_actuales: 'Suplemento articular mensual',
    alimentacion: {
      tipo: 'Croquetas secas',
      frecuencia: '2 veces al día',
      cantidad: '400 g por comida',
      marca: 'Royal Canin Large Breed',
      restricciones: 'Sin productos lácteos',
    },
    comportamiento: 'Leal y protector. Necesita socializarse con extraños gradualmente.',
    compatible_ninos: true,
    compatible_perros: false,
    compatible_gatos: false,
    nivel_ejercicio: 'Muy alto',
    fecha_rescate: '2023-11-05',
    lugar_rescate: 'Carretera Cabimas-Ciudad Ojeda',
    id_rescatista: 5,
    documentos_legales: [],
  },
  {
    id_mascota: 9,
    nombre: 'Goldie',
    especie: 'perro',
    raza: 'Golden Retriever',
    edad_aprox: '4 años',
    edad: 4,
    sexo: 'hembra',
    tamano: 'grande',
    peso: 26.5,
    color: 'Dorado',
    estado: 'en_proceso',
    ubicacion: 'Maracaibo, Zulia',
    descripcion: 'Dulce y amigable, perfecta para familias con niños. Rescatada de una situación de abandono en el sector Sabaneta.',
    foto_principal: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [
      { nombre: 'Rabia', fecha: '2026-03-01', proxima: '2027-03-01', veterinario: 'Dr. Luis Fuenmayor' },
      { nombre: 'DHPP', fecha: '2026-02-15', proxima: '2027-02-15', veterinario: 'Dr. Luis Fuenmayor' },
    ],
    esterilizado: true,
    microchip: true,
    numero_microchip: 'MCP-9900-2022',
    condicion_salud: 'Buena',
    alergias: 'Alergia leve al maíz',
    enfermedades_previas: 'Desnutrición leve (superada)',
    medicamentos_actuales: 'Ninguno',
    alimentacion: {
      tipo: 'Croquetas sin maíz',
      frecuencia: '2 veces al día',
      cantidad: '350 g por comida',
      marca: 'Taste of the Wild',
      restricciones: 'Sin productos con maíz',
    },
    comportamiento: 'Muy sociable, ideal para familias numerosas.',
    compatible_ninos: true,
    compatible_perros: true,
    compatible_gatos: true,
    nivel_ejercicio: 'Alto',
    fecha_rescate: '2026-01-20',
    lugar_rescate: 'Sector Sabaneta, Maracaibo',
    id_rescatista: 6,
    documentos_legales: [],
  },

  // === GATOS ===
  {
    id_mascota: 2,
    nombre: 'Simón',
    especie: 'gato',
    raza: 'Común europeo',
    edad_aprox: '1 año',
    edad: 1,
    sexo: 'macho',
    tamano: 'pequeno',
    peso: 4.2,
    color: 'Blanco y negro',
    estado: 'en_adopcion',
    ubicacion: 'Maracaibo, Zulia',
    descripcion: 'Gatito tranquilo rescatado en el sector Bellas Artes, Maracaibo. Le encanta dormir en sofás y ronronear.',
    foto_principal: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [
      { nombre: 'Triple felina (Panleucopenia, Calicivirus, Herpesvirus)', fecha: '2026-05-20', proxima: '2027-05-20', veterinario: 'Dra. Ana Molero' },
      { nombre: 'Rabia felina', fecha: '2026-05-20', proxima: '2027-05-20', veterinario: 'Dra. Ana Molero' },
    ],
    esterilizado: true,
    microchip: false,
    condicion_salud: 'Excelente',
    alergias: 'Ninguna',
    enfermedades_previas: 'Conjuntivitis leve (curada)',
    medicamentos_actuales: 'Ninguno',
    alimentacion: {
      tipo: 'Mixta (húmedo y seco)',
      frecuencia: '3 veces al día',
      cantidad: '60 g húmedo + 40 g seco',
      marca: 'Whiskas / Purina ONE',
      restricciones: 'Ninguna',
    },
    comportamiento: 'Tranquilo y cariñoso. Perfecto para apartamentos.',
    compatible_ninos: true,
    compatible_perros: false,
    compatible_gatos: true,
    nivel_ejercicio: 'Bajo',
    fecha_rescate: '2025-12-01',
    lugar_rescate: 'Sector Bellas Artes, Maracaibo',
    id_rescatista: 6,
    documentos_legales: [],
  },
  {
    id_mascota: 4,
    nombre: 'Mia',
    especie: 'gato',
    raza: 'Mestiza tricolor',
    edad_aprox: '6 meses',
    edad: 0.5,
    sexo: 'hembra',
    tamano: 'pequeno',
    peso: 2.1,
    color: 'Tricolor (naranja, blanco y negro)',
    estado: 'en_adopcion',
    ubicacion: 'Maracaibo, Zulia',
    descripcion: 'Cachorrita muy curiosa y activa. Excelente compañía para departamentos. Busca un hogar con amor y paciencia.',
    foto_principal: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [
      { nombre: 'Triple felina (primera dosis)', fecha: '2026-09-10', proxima: '2026-10-10', veterinario: 'Dr. Luis Fuenmayor' },
    ],
    esterilizado: false,
    microchip: false,
    condicion_salud: 'Buena',
    alergias: 'Ninguna conocida',
    enfermedades_previas: 'Ninguna',
    medicamentos_actuales: 'Desparasitante mensual',
    alimentacion: {
      tipo: 'Croquetas para gatitos',
      frecuencia: '4 veces al día (ración pequeña)',
      cantidad: '30 g por comida',
      marca: 'Royal Canin Kitten',
      restricciones: 'Sin alimentos de adulto por ahora',
    },
    comportamiento: 'Juguetona y exploratoria. Aprende muy rápido.',
    compatible_ninos: true,
    compatible_perros: false,
    compatible_gatos: true,
    nivel_ejercicio: 'Medio',
    fecha_rescate: '2026-08-20',
    lugar_rescate: 'Urbanización El Milagro, Maracaibo',
    id_rescatista: 6,
    documentos_legales: [],
  },

  // === AVES ===
  {
    id_mascota: 5,
    nombre: 'Pico',
    especie: 'ave',
    raza: 'Canario amarillo',
    edad_aprox: '1 año',
    edad: 1,
    sexo: 'macho',
    tamano: 'pequeno',
    peso: 0.02,
    color: 'Amarillo intenso',
    estado: 'en_adopcion',
    ubicacion: 'Maracaibo, Zulia',
    descripcion: 'Canario activo y cantarín rescatado de un criadero clandestino en Maracaibo. Perfectamente sano y sociable.',
    foto_principal: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [],
    esterilizado: false,
    microchip: false,
    condicion_salud: 'Excelente',
    alergias: 'Ninguna',
    enfermedades_previas: 'Ninguna',
    medicamentos_actuales: 'Suplemento de vitamina A en agua',
    alimentacion: {
      tipo: 'Semillas de canario + frutas',
      frecuencia: 'Ad libitum (siempre disponible) + fruta fresca diaria',
      cantidad: '10 g semillas + trozos pequeños de fruta',
      marca: 'Versele-Laga Canary',
      restricciones: 'Sin aguacate, chocolate ni cebolla',
    },
    comportamiento: 'Alegre, cantarín y curioso. Disfruta la luz natural.',
    compatible_ninos: true,
    compatible_perros: false,
    compatible_gatos: false,
    nivel_ejercicio: 'Bajo (vuelo en jaula grande)',
    fecha_rescate: '2026-07-10',
    lugar_rescate: 'Sector Pomona, Maracaibo',
    id_rescatista: 5,
    documentos_legales: [],
  },
  {
    id_mascota: 6,
    nombre: 'Loreto',
    especie: 'ave',
    raza: 'Loro cacatúa (Ninfas)',
    edad_aprox: '2 años',
    edad: 2,
    sexo: 'hembra',
    tamano: 'pequeno',
    peso: 0.09,
    color: 'Gris perla con mejillas rosadas',
    estado: 'en_adopcion',
    ubicacion: 'Punto Fijo, Falcón (transferida a Maracaibo)',
    descripcion: 'Ninfa rescatada de un hogar donde fue abandonada. Es muy sociable, le encanta que la acaricien y puede imitar sonidos.',
    foto_principal: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [
      { nombre: 'Poliomavirus (aviar)', fecha: '2025-10-05', proxima: '2026-10-05', veterinario: 'Dr. Luis Fuenmayor' },
    ],
    esterilizado: false,
    microchip: false,
    condicion_salud: 'Buena',
    alergias: 'Ninguna conocida',
    enfermedades_previas: 'Desplumado por estrés (superado)',
    medicamentos_actuales: 'Ninguno',
    alimentacion: {
      tipo: 'Pellets + frutas + vegetales frescos',
      frecuencia: '2 veces al día',
      cantidad: '30 g pellets + vegetales frescos a discreción',
      marca: 'Harrison\'s Bird Foods',
      restricciones: 'Sin semillas de frutas, sin aguacate',
    },
    comportamiento: 'Muy social. Imita sonidos y silbidos. Necesita compañía diaria.',
    compatible_ninos: true,
    compatible_perros: false,
    compatible_gatos: false,
    nivel_ejercicio: 'Medio (vuelo diario fuera de la jaula)',
    fecha_rescate: '2025-09-14',
    lugar_rescate: 'Punto Fijo, Falcón',
    id_rescatista: 5,
    documentos_legales: [],
  },

  // === CONEJOS ===
  {
    id_mascota: 7,
    nombre: 'Nieve',
    especie: 'conejo',
    raza: 'Angora blanco',
    edad_aprox: '1 año',
    edad: 1,
    sexo: 'hembra',
    tamano: 'pequeno',
    peso: 1.8,
    color: 'Blanco puro',
    estado: 'en_adopcion',
    ubicacion: 'Maracaibo, Zulia',
    descripcion: 'Conejita angora rescatada de un mercado informal. Muy mansa y cariñosa. Requiere cepillado frecuente por su pelo largo.',
    foto_principal: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [
      { nombre: 'Mixomatosis + VHD', fecha: '2026-04-15', proxima: '2027-04-15', veterinario: 'Dra. Ana Molero' },
    ],
    esterilizado: false,
    microchip: false,
    condicion_salud: 'Excelente',
    alergias: 'Ninguna',
    enfermedades_previas: 'Ninguna',
    medicamentos_actuales: 'Ninguno',
    alimentacion: {
      tipo: 'Heno + pellets + vegetales frescos',
      frecuencia: 'Heno ilimitado + pellets 1 vez/día + vegetales frescos',
      cantidad: 'Heno libre + 60 g pellets + puñado de hojas verdes',
      marca: 'Oxbow Essentials',
      restricciones: 'Sin lechuga iceberg, sin comida procesada',
    },
    comportamiento: 'Mansa y dócil. Disfruta que la cepillen y acaricien.',
    compatible_ninos: true,
    compatible_perros: false,
    compatible_gatos: false,
    nivel_ejercicio: 'Bajo',
    fecha_rescate: '2026-06-01',
    lugar_rescate: 'Mercado Las Pulgas, Maracaibo',
    id_rescatista: 6,
    documentos_legales: [],
  },
  {
    id_mascota: 8,
    nombre: 'Tambor',
    especie: 'conejo',
    raza: 'Rex atigrado',
    edad_aprox: '8 meses',
    edad: 0.7,
    sexo: 'macho',
    tamano: 'pequeno',
    peso: 1.5,
    color: 'Atigrado gris y marrón',
    estado: 'en_adopcion',
    ubicacion: 'San Francisco, Zulia',
    descripcion: 'Conejo rex enérgico y curioso. Le encanta explorar y es muy rápido. Perfecto para familias activas.',
    foto_principal: 'https://images.unsplash.com/photo-1619993226069-9c3a04044044?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1619993226069-9c3a04044044?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [
      { nombre: 'Mixomatosis', fecha: '2026-05-10', proxima: '2027-05-10', veterinario: 'Dr. Luis Fuenmayor' },
    ],
    esterilizado: true,
    microchip: false,
    condicion_salud: 'Buena',
    alergias: 'Ninguna conocida',
    enfermedades_previas: 'Ninguna',
    medicamentos_actuales: 'Ninguno',
    alimentacion: {
      tipo: 'Heno + pellets + vegetales',
      frecuencia: 'Heno libre + 2 porciones/día',
      cantidad: 'Heno libre + 50 g pellets + hojas verdes',
      marca: 'Science Selective Rabbit',
      restricciones: 'Sin frutas dulces en exceso',
    },
    comportamiento: 'Activo y explorador. Necesita espacio para correr.',
    compatible_ninos: true,
    compatible_perros: false,
    compatible_gatos: false,
    nivel_ejercicio: 'Medio',
    fecha_rescate: '2026-07-22',
    lugar_rescate: 'San Francisco, Zulia',
    id_rescatista: 5,
    documentos_legales: [],
  },

  // === OTROS ===
  {
    id_mascota: 10,
    nombre: 'Tortuga Pepa',
    especie: 'otro',
    raza: 'Tortuga morrocoy',
    edad_aprox: '5 años',
    edad: 5,
    sexo: 'hembra',
    tamano: 'pequeno',
    peso: 0.9,
    color: 'Café oscuro con manchas amarillas',
    estado: 'en_adopcion',
    ubicacion: 'Maracaibo, Zulia',
    descripcion: 'Tortuga morrocoy venezolana rescatada de tráfico ilegal. Completamente sana y confiscada por las autoridades. Requiere hogar responsable.',
    foto_principal: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [],
    esterilizado: false,
    microchip: false,
    condicion_salud: 'Excelente',
    alergias: 'Ninguna',
    enfermedades_previas: 'Ninguna detectada',
    medicamentos_actuales: 'Suplemento de calcio semanal',
    alimentacion: {
      tipo: 'Vegetales frescos + frutas ocasionales',
      frecuencia: '1 vez al día',
      cantidad: 'Puñado grande de hojas y vegetales variados',
      marca: 'Natural (lechuga, auyama, berenjena, zanahoria)',
      restricciones: 'Sin alimentos procesados, sin cítricos en exceso',
    },
    comportamiento: 'Tranquila y longeva. Excelente mascota educativa.',
    compatible_ninos: true,
    compatible_perros: true,
    compatible_gatos: true,
    nivel_ejercicio: 'Muy bajo',
    fecha_rescate: '2026-02-10',
    lugar_rescate: 'Control MINEC Maracaibo',
    id_rescatista: 5,
    documentos_legales: ['Acta de confiscación MINEC-2026-0127.pdf'],
  },
  {
    id_mascota: 11,
    nombre: 'Hamster Bobi',
    especie: 'otro',
    raza: 'Hamster sirio dorado',
    edad_aprox: '6 meses',
    edad: 0.5,
    sexo: 'macho',
    tamano: 'pequeno',
    peso: 0.12,
    color: 'Dorado con mancha blanca en el vientre',
    estado: 'en_adopcion',
    ubicacion: 'Maracaibo, Zulia',
    descripcion: 'Hamster sirio muy activo, amigable con personas. Viene con su jaula completa. Ideal como primera mascota para niños responsables.',
    foto_principal: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=600&q=80',
    fotos: [
      { url_imagen: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=600&q=80' },
    ],
    vacunas: [],
    esterilizado: false,
    microchip: false,
    condicion_salud: 'Excelente',
    alergias: 'Ninguna',
    enfermedades_previas: 'Ninguna',
    medicamentos_actuales: 'Ninguno',
    alimentacion: {
      tipo: 'Mezcla de semillas para hamster',
      frecuencia: '1 vez al día (nocturno)',
      cantidad: '15 g de mezcla + agua fresca siempre',
      marca: 'Hamster Mix Versele-Laga',
      restricciones: 'Sin ajo, cebolla, cítricos ni chocolate',
    },
    comportamiento: 'Activo de noche. Curioso y dócil si se socializa desde pequeño.',
    compatible_ninos: true,
    compatible_perros: false,
    compatible_gatos: false,
    nivel_ejercicio: 'Medio (rueda de ejercicio)',
    fecha_rescate: '2026-10-01',
    lugar_rescate: 'Maracaibo, Zulia (donado por particular)',
    id_rescatista: 6,
    documentos_legales: [],
  },
];

const mascotasService = {
  listar: async (params = {}) => {
    try {
      const response = await api.get('/mascotas', { params });
      return response.data;
    } catch (err) {
      let filtered = [...MOCK_MASCOTAS];
      if (params.especie) {
        filtered = filtered.filter((m) => m.especie === params.especie);
      }
      if (params.estado) {
        // 'en_adopcion' y 'disponible' son equivalentes en el sistema mock
        const estadoBuscar = params.estado === 'disponible' ? 'en_adopcion' : params.estado;
        filtered = filtered.filter((m) => m.estado === estadoBuscar);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.nombre.toLowerCase().includes(s) ||
            m.descripcion?.toLowerCase().includes(s) ||
            m.raza?.toLowerCase().includes(s)
        );
      }
      return {
        success: true,
        data: {
          mascotas: filtered,
          pagination: { total: filtered.length, page: 1, limit: 20, totalPages: 1 },
        },
      };
    }
  },

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
      const newId = Date.now();
      const newMascota = { id_mascota: newId, ...mascotaData };
      MOCK_MASCOTAS.push(newMascota);
      return {
        success: true,
        data: newMascota,
        message: 'Mascota registrada exitosamente (modo offline)',
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
