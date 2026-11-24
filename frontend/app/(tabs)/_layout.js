import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import ProtectedRoute from '../../src/components/ProtectedRoute';

export default function TabsLayout() {
  const theme = useTheme();
  const { user } = useAuth();
  const rol = user?.rol?.toLowerCase() || '';

  // Determinar qué tabs mostrar según rol
  const showRescates = rol === 'rescatista';
  const showSolicitudes = rol === 'adoptante' || rol === 'rescatista';
  const showExpedientes = rol === 'veterinario';
  const showAdmin = rol === 'administrador' || rol === 'admin';

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
            borderTopWidth: 0.5,
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="mascotas"
          options={{
            title: 'Mascotas',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="paw" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="rescates"
          options={{
            title: 'Rescates',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="hand-heart" size={size} color={color} />
            ),
            href: showRescates ? undefined : null,
          }}
        />

        <Tabs.Screen
          name="solicitudes"
          options={{
            title: 'Solicitudes',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="file-document-edit" size={size} color={color} />
            ),
            href: showSolicitudes ? undefined : null,
          }}
        />

        <Tabs.Screen
          name="expedientes"
          options={{
            title: 'Expedientes',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="medical-bag" size={size} color={color} />
            ),
            href: showExpedientes ? undefined : null,
          }}
        />

        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="shield-crown" size={size} color={color} />
            ),
            href: showAdmin ? undefined : null,
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
