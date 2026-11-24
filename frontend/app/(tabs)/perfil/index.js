import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Chip,
  Divider,
  useTheme,
  Snackbar,
  Dialog,
  Portal,
} from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../src/hooks/useAuth';

const rolIcons = {
  adoptante: 'account-heart',
  rescatista: 'hand-heart',
  veterinario: 'medical-bag',
  administrador: 'shield-crown',
  admin: 'shield-crown',
};

const rolLabels = {
  adoptante: 'Adoptante',
  rescatista: 'Rescatista',
  veterinario: 'Veterinario',
  administrador: 'Administrador',
  admin: 'Administrador',
};

export default function PerfilIndex() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [logoutDialog, setLogoutDialog] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const rol = user?.rol?.toLowerCase() || '';

  const handleLogout = async () => {
    setLogoutDialog(false);
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return null;
  }

  const initials = user.nombre
    ? user.nombre
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '??';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Mi Perfil',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar y nombre */}
        <Card
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          elevation={2}
        >
          <Card.Content style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label={initials}
              style={{ backgroundColor: theme.colors.primary }}
              labelStyle={{ fontSize: 28, fontWeight: '700' }}
            />
            <Text
              variant="headlineSmall"
              style={[styles.userName, { color: theme.colors.onSurface }]}
            >
              {user.nombre}
            </Text>
            <Chip
              icon={rolIcons[rol] || 'account'}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              textStyle={{ color: theme.colors.onPrimaryContainer, fontWeight: '600' }}
            >
              {rolLabels[rol] || rol}
            </Chip>
          </Card.Content>
        </Card>

        {/* Información del perfil */}
        <Card
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        >
          <Card.Content>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Información Personal
            </Text>

            <Divider style={styles.divider} />

            <ProfileField
              icon="email"
              label="Correo electrónico"
              value={user.correo || user.email}
              color={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            <ProfileField
              icon="phone"
              label="Teléfono"
              value={user.telefono || 'No especificado'}
              color={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            <ProfileField
              icon="map-marker"
              label="Dirección"
              value={user.direccion || 'No especificada'}
              color={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            {/* Campos específicos por rol */}
            {rol === 'adoptante' && (
              <>
                <ProfileField
                  icon="cash"
                  label="Ingresos aproximados"
                  value={
                    user.ingresos_aproximados
                      ? `Bs. ${user.ingresos_aproximados}`
                      : 'No especificado'
                  }
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
                <ProfileField
                  icon="heart"
                  label="Experiencia"
                  value={user.experiencia || 'No especificada'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
              </>
            )}

            {rol === 'rescatista' && (
              <>
                <ProfileField
                  icon="home-group"
                  label="Organización"
                  value={user.organizacion || 'No especificada'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
                <ProfileField
                  icon="hand-heart"
                  label="Experiencia"
                  value={user.experiencia || 'No especificada'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
              </>
            )}

            {rol === 'veterinario' && (
              <>
                <ProfileField
                  icon="stethoscope"
                  label="Especialidad"
                  value={user.especialidad || 'No especificada'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
                <ProfileField
                  icon="card-account-details"
                  label="Licencia"
                  value={user.licencia || 'No especificada'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
              </>
            )}

            {user.createdAt && (
              <ProfileField
                icon="calendar"
                label="Miembro desde"
                value={new Date(user.createdAt).toLocaleDateString('es-VE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                color={theme.colors.primary}
                textColor={theme.colors.onSurface}
              />
            )}
          </Card.Content>
        </Card>

        {/* Acciones */}
        <Card
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        >
          <Card.Content>
            <Button
              mode="outlined"
              icon="refresh"
              onPress={refreshUser}
              textColor={theme.colors.primary}
              style={styles.actionBtn}
            >
              Actualizar datos
            </Button>

            <Button
              mode="contained"
              icon="logout"
              onPress={() => setLogoutDialog(true)}
              buttonColor={theme.colors.error}
              textColor="#FFFFFF"
              style={styles.actionBtn}
            >
              Cerrar Sesión
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Dialog de confirmación de logout */}
      <Portal>
        <Dialog
          visible={logoutDialog}
          onDismiss={() => setLogoutDialog(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Cerrar Sesión
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialog(false)} textColor={theme.colors.onSurfaceVariant}>
              Cancelar
            </Button>
            <Button onPress={handleLogout} textColor={theme.colors.error}>
              Cerrar Sesión
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2000}
      >
        {snackMessage}
      </Snackbar>
    </View>
  );
}

function ProfileField({ icon, label, value, color, textColor }) {
  return (
    <View style={fieldStyles.row}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <View style={fieldStyles.textCol}>
        <Text variant="labelSmall" style={{ color }}>
          {label}
        </Text>
        <Text variant="bodyMedium" style={{ color: textColor }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  textCol: {
    flex: 1,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  userName: {
    fontWeight: '700',
  },
  sectionTitle: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
  },
  actionBtn: {
    borderRadius: 8,
    marginBottom: 12,
  },
});
