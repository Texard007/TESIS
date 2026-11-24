import Constants from 'expo-constants';

// Intentar leer desde variables de entorno, sino usar valor por defecto
let API_URL = 'http://localhost:4000/api';

try {
  const extra = Constants.expoConfig?.extra;
  if (extra?.API_URL) {
    API_URL = extra.API_URL;
  }
} catch (e) {
  // usar valor por defecto
}

// Para desarrollo web, intentar usar la URL del host actual
if (typeof window !== 'undefined' && API_URL.includes('localhost')) {
  const hostname = window.location?.hostname;
  if (hostname && hostname !== 'localhost') {
    API_URL = API_URL.replace('localhost', hostname);
  }
}

export { API_URL };
