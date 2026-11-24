import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Text, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import ProtectedRoute from '../../src/components/ProtectedRoute';

function DesktopNavbar({
  user,
  rol,
  currentPath,
  router,
  theme,
  showRescates,
  showSolicitudes,
  showExpedientes,
  showAdmin,
}) {
  const navItems = [
    { key: 'mascotas', route: '/(tabs)/mascotas', label: 'Mascotas', icon: 'paw', visible: true },
    { key: 'rescates', route: '/(tabs)/rescates', label: 'Rescates', icon: 'hand-heart', visible: showRescates },
    { key: 'solicitudes', route: '/(tabs)/solicitudes', label: 'Solicitudes', icon: 'file-document-edit', visible: showSolicitudes },
    { key: 'expedientes', route: '/(tabs)/expedientes', label: 'Expedientes', icon: 'medical-bag', visible: showExpedientes },
    { key: 'admin', route: '/(tabs)/admin', label: 'Panel Admin', icon: 'shield-crown', visible: showAdmin },
    { key: 'perfil', route: '/(tabs)/perfil', label: 'Mi Perfil', icon: 'account-circle', visible: true },
  ].filter((i) => i.visible);

  return (
    <View
      style={[
        desktopStyles.wrapper,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <View style={desktopStyles.inner}>
        {/* Brand */}
        <Pressable
          onPress={() => router.push('/(tabs)/mascotas')}
          style={desktopStyles.brand}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={desktopStyles.logo}
            resizeMode="contain"
          />
          <View>
            <Text
              variant="titleMedium"
              style={{ fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 }}
            >
              Adopción Zulia
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Comunidad de Rescate y Adopción
            </Text>
          </View>
        </Pressable>

        {/* Navigation Items */}
        <View style={desktopStyles.linksRow}>
          {navItems.map((item) => {
            const isActive = currentPath && currentPath.includes(item.key);
            return (
              <Pressable
                key={item.key}
                onPress={() => router.push(item.route)}
                style={[
                  desktopStyles.navPill,
                  isActive && { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={18}
                  color={isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    desktopStyles.navLabel,
                    {
                      color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* User Profile Pill */}
        <Pressable
          onPress={() => router.push('/(tabs)/perfil')}
          style={desktopStyles.userArea}
        >
          <View style={desktopStyles.userInfo}>
            <Text
              variant="labelMedium"
              style={{ fontWeight: '700', color: theme.colors.onSurface }}
            >
              {user?.nombre?.split(' ')[0] || 'Usuario'}
            </Text>
            <Chip
              compact
              style={{ height: 22, backgroundColor: theme.colors.secondaryContainer }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.onSecondaryContainer,
                  textTransform: 'capitalize',
                }}
              >
                {rol || 'adoptante'}
              </Text>
            </Chip>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const { user } = useAuth();
  const rol = user?.rol?.toLowerCase() || '';

  // Determinar qué tabs mostrar según rol
  const showRescates = rol === 'rescatista' || rol === 'administrador' || rol === 'admin';
  const showSolicitudes = rol === 'adoptante' || rol === 'rescatista' || rol === 'administrador' || rol === 'admin';
  const showExpedientes = rol === 'veterinario' || rol === 'administrador' || rol === 'admin';
  const showAdmin = rol === 'administrador' || rol === 'admin';

  return (
    <ProtectedRoute>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {isWide && (
          <DesktopNavbar
            user={user}
            rol={rol}
            currentPath={pathname}
            router={router}
            theme={theme}
            showRescates={showRescates}
            showSolicitudes={showSolicitudes}
            showExpedientes={showExpedientes}
            showAdmin={showAdmin}
          />
        )}
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
            tabBarStyle: isWide
              ? { display: 'none' }
              : {
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
      </View>
    </ProtectedRoute>
  );
}

const desktopStyles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    zIndex: 100,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navLabel: {
    fontSize: 13,
  },
  userArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
