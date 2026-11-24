import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/auth.service';

export const AuthContext = createContext({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  loginDemo: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar token guardado al iniciar
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Si es una sesión demo, no validar contra el backend
        if (storedToken.startsWith('demo-')) {
          return;
        }

        // Verificar si el token real sigue siendo válido
        try {
          const result = await authService.getMe();
          if (result.success && result.data) {
            setUser(result.data);
            await AsyncStorage.setItem('user_data', JSON.stringify(result.data));
          }
        } catch (err) {
          // Si el servidor está apagado temporalmente, no borrar la sesión local
          if (err.message !== 'Network Error') {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user_data');
            setToken(null);
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.warn('Error cargando auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success && result.data) {
      const { token: newToken, user: userObj, usuario } = result.data;
      const currentUser = userObj || usuario;
      if (newToken) {
        await AsyncStorage.setItem('auth_token', newToken);
        setToken(newToken);
      }
      if (currentUser) {
        await AsyncStorage.setItem('user_data', JSON.stringify(currentUser));
        setUser(currentUser);
      }
    }
    return result;
  }, []);

  const loginDemo = useCallback(async (rol = 'adoptante') => {
    const demoProfiles = {
      adoptante: {
        id_usuario: 4,
        nombre: 'Juan Adoptante (Demo)',
        correo: 'juan.adoptante@gmail.com',
        rol: 'adoptante',
        telefono: '0414-1234567',
        estado: 'activo',
        ingresos_aproximados: 450,
        tipo_vivienda: 'casa',
        tiene_jardin: true,
      },
      rescatista: {
        id_usuario: 3,
        nombre: 'María Rescatista (Demo)',
        correo: 'maria.rescatista@fundacionhuellas.org',
        rol: 'rescatista',
        telefono: '0424-7654321',
        estado: 'activo',
        organizacion: 'Fundación Huellas Zulia',
        zona_rescate: 'Maracaibo / San Francisco',
      },
      veterinario: {
        id_usuario: 2,
        nombre: 'Dr. Carlos Veterinario (Demo)',
        correo: 'vet.carlos@veterinariazulia.com',
        rol: 'veterinario',
        telefono: '0412-9876543',
        estado: 'activo',
        numero_licencia: 'VET-ZUL-8492',
        clinica_asociada: 'Clínica Veterinaria La Chinita',
      },
      administrador: {
        id_usuario: 1,
        nombre: 'Admin General (Demo)',
        correo: 'admin@adopcionzulia.org',
        rol: 'administrador',
        telefono: '0414-0000000',
        estado: 'activo',
        nivel_acceso: 3,
      },
    };

    const currentUser = demoProfiles[rol] || demoProfiles.adoptante;
    const fakeToken = `demo-token-${rol}-${Date.now()}`;

    await AsyncStorage.setItem('auth_token', fakeToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(currentUser));
    setToken(fakeToken);
    setUser(currentUser);

    return {
      success: true,
      data: { user: currentUser, token: fakeToken },
      message: 'Modo demostración iniciado correctamente',
    };
  }, []);

  const register = useCallback(async (userData) => {
    const result = await authService.register(userData);
    if (result.success && result.data) {
      const { token: newToken, user: userObj, usuario } = result.data;
      const currentUser = userObj || usuario;
      if (newToken) {
        await AsyncStorage.setItem('auth_token', newToken);
        setToken(newToken);
      }
      if (currentUser) {
        await AsyncStorage.setItem('user_data', JSON.stringify(currentUser));
        setUser(currentUser);
      }
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken && storedToken.startsWith('demo-')) {
        return;
      }
      const result = await authService.getMe();
      if (result.success && result.data) {
        setUser(result.data);
        await AsyncStorage.setItem('user_data', JSON.stringify(result.data));
      }
    } catch (error) {
      console.warn('Error refrescando usuario:', error);
    }
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    loginDemo,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
