import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Switch,
  Chip,
  Searchbar,
  useTheme,
  Snackbar,
  Dialog,
  Portal,
  Button,
} from 'react-native-paper';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import adminService from '../../../src/services/admin.service';
import LoadingScreen from '../../../src/components/LoadingScreen';
import EmptyState from '../../../src/components/EmptyState';
import ErrorMessage from '../../../src/components/ErrorMessage';

const rolColors = {
  adoptante: '#4CAF50',
  rescatista: '#FF9800',
  veterinario: '#2196F3',
  administrador: '#9C27B0',
  admin: '#9C27B0',
};

const rolLabels = {
  adoptante: 'Adoptante',
  rescatista: 'Rescatista',
  veterinario: 'Veterinario',
  administrador: 'Admin',
  admin: 'Admin',
};

export default function UsuariosAdmin() {
  const theme = useTheme();

  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog de confirmación
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newEstado, setNewEstado] = useState('');
  const [updating, setUpdating] = useState(false);

  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setFilteredUsuarios(
        usuarios.filter(
          (u) =>
            u.nombre?.toLowerCase().includes(q) ||
            (u.correo || u.email)?.toLowerCase().includes(q) ||
            u.rol?.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredUsuarios(usuarios);
    }
  }, [searchQuery, usuarios]);

  const fetchUsuarios = async () => {
    try {
      setError('');
      const result = await adminService.listarUsuarios();
      if (result.success) {
        const data = result.data;
        const list = Array.isArray(data) ? data : (data.usuarios || data.users || []);
        setUsuarios(list);
      } else {
        setError(result.message || 'Error al cargar usuarios.');
      }
    } catch (err) {
      setError('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleEstado = (usuario) => {
    const currentEstado = usuario.estado || 'activo';
    const nuevoEstado = currentEstado === 'activo' ? 'inactivo' : 'activo';
    setSelectedUser(usuario);
    setNewEstado(nuevoEstado);
    setConfirmDialog(true);
  };

  const confirmChangeEstado = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      const userId = selectedUser.id_usuario || selectedUser._id || selectedUser.id;
      const result = await adminService.cambiarEstadoUsuario(userId, {
        estado: newEstado,
      });
      if (result.success) {
        setSnackMessage(
          `Usuario ${selectedUser.nombre} ${newEstado === 'activo' ? 'activado' : 'desactivado'}.`
        );
        setSnackVisible(true);
        // Actualizar lista local
        setUsuarios((prev) =>
          prev.map((u) =>
            (u.id_usuario || u._id || u.id) === userId
              ? { ...u, estado: newEstado }
              : u
          )
        );
      } else {
        setSnackMessage(result.message || 'Error al cambiar estado.');
        setSnackVisible(true);
      }
    } catch (err) {
      setSnackMessage(
        err.response?.data?.message || 'Error al cambiar estado del usuario.'
      );
      setSnackVisible(true);
    } finally {
      setUpdating(false);
      setConfirmDialog(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Usuarios', headerShown: true }} />
        <LoadingScreen message="Cargando usuarios..." />
      </>
    );
  }

  const renderUsuario = ({ item }) => {
    const rol = item.rol?.toLowerCase() || '';
    const estadoActivo = (item.estado || 'activo') === 'activo';

    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <Card.Content style={styles.userRow}>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={theme.colors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  variant="titleSmall"
                  style={{ color: theme.colors.onSurface, fontWeight: '600' }}
                >
                  {item.nombre || 'Sin nombre'}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {item.email}
                </Text>
              </View>
            </View>

            <View style={styles.chipRow}>
              <Chip
                compact
                style={{ backgroundColor: rolColors[rol] || '#9E9E9E' }}
                textStyle={{ color: '#FFF', fontSize: 10, fontWeight: '600' }}
              >
                {rolLabels[rol] || rol}
              </Chip>
              <Chip
                compact
                style={{
                  backgroundColor: estadoActivo ? '#E8F5E9' : '#FFEBEE',
                }}
                textStyle={{
                  color: estadoActivo ? '#2E7D32' : '#C62828',
                  fontSize: 10,
                }}
              >
                {estadoActivo ? 'Activo' : 'Inactivo'}
              </Chip>
            </View>
          </View>

          <Switch
            value={estadoActivo}
            onValueChange={() => handleToggleEstado(item)}
            color={theme.colors.secondary}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Gestión de Usuarios',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      <Searchbar
        placeholder="Buscar usuarios..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.primary}
      />

      {error ? (
        <ErrorMessage message={error} onRetry={fetchUsuarios} />
      ) : null}

      {filteredUsuarios.length === 0 && !error ? (
        <EmptyState
          icon="account-off"
          title="No hay usuarios"
          message={
            searchQuery
              ? 'No se encontraron usuarios con esa búsqueda.'
              : 'No hay usuarios registrados en el sistema.'
          }
        />
      ) : (
        <FlatList
          data={filteredUsuarios}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderUsuario}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchUsuarios();
              }}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      {/* Dialog de confirmación */}
      <Portal>
        <Dialog
          visible={confirmDialog}
          onDismiss={() => setConfirmDialog(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Confirmar cambio
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              ¿Estás seguro de{' '}
              {newEstado === 'activo' ? 'activar' : 'desactivar'} al usuario{' '}
              <Text style={{ fontWeight: '600' }}>
                {selectedUser?.nombre}
              </Text>
              ?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConfirmDialog(false)}
              textColor={theme.colors.onSurfaceVariant}
            >
              Cancelar
            </Button>
            <Button
              onPress={confirmChangeEstado}
              loading={updating}
              disabled={updating}
              textColor={
                newEstado === 'activo' ? theme.colors.secondary : theme.colors.error
              }
            >
              {newEstado === 'activo' ? 'Activar' : 'Desactivar'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
    elevation: 1,
    borderRadius: 12,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    borderRadius: 12,
    marginBottom: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 34,
  },
});
