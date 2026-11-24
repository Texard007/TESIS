import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Detecta dinámicamente la IP de la computadora en la red local.
 * En dispositivos móviles, 'localhost' apunta al propio celular, por lo que
 * se extrae la IP del host de Expo (Metro) o se usa la IP LAN de la PC.
 */
const getHostIp = () => {
  // 1. Si estamos en Expo Go / desarrollo, extraer IP de hostUri
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  // 2. Si estamos en navegador web, usar el hostname actual (localhost o IP)
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    if (hostname) {
      return hostname;
    }
  }

  // 3. IP local Ethernet de la computadora para la red Wi-Fi
  return '192.168.1.200';
};

const host = getHostIp();
let API_URL = `http://${host}:4000/api`;

// Si se especificó una URL personalizada en app.json o .env
try {
  const extra = Constants.expoConfig?.extra;
  if (extra?.API_URL) {
    API_URL = extra.API_URL;
  }
} catch (e) {
  // mantener valor detectado
}

export { API_URL, host };
