import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Redirect } from 'expo-router';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const userRole = user.rol?.toLowerCase();
    if (!allowedRoles.includes(userRole)) {
      return <Redirect href="/(tabs)/mascotas" />;
    }
  }

  return children;
}
