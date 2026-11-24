import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/auth.service';

export const AuthContext = createContext({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
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
        // Verificar que el token siga siendo válido
        try {
          const result = await authService.getMe();
          if (result.success && result.data) {
            setUser(result.data);
            await AsyncStorage.setItem('user_data', JSON.stringify(result.data));
          }
        } catch (err) {
          // Token inválido, limpiar
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          setToken(null);
          setUser(null);
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
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
