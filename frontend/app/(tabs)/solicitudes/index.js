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
  Chip,
  Button,
  useTheme,
} from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import solicitudesService from '../../../src/services/solicitudes.service';
import { useAuth } from '../../../src/hooks/useAuth';
import LoadingScreen from '../../../src/components/LoadingScreen';
import EmptyState from '../../../src/components/EmptyState';
import ErrorMessage from '../../../src/components/ErrorMessage';

const estadoSolicitudColors = {
  pendiente: '#FF9800',
  aprobada: '#4CAF50',
  rechazada: '#F44336',
  en_revision: '#2196F3',
};

const estadoSolicitudLabels = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  en_revision: 'En revisión',
};

export default function SolicitudesIndex() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const rol = user?.rol?.toLowerCase() || '';

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setError('');
      const result = await solicitudesService.listar();
      if (result.success) {
        const data = result.data;
        const list = Array.isArray(data) ? data : data.solicitudes || data.items || [];
        setSolicitudes(list);
      } else {
        setError(result.message || 'Error al cargar solicitudes.');
      }
    } catch (err) {
      setError('Error al cargar solicitudes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Solicitudes', headerShown: true }} />
        <LoadingScreen message="Cargando solicitudes..." />
      </>
    );
  }

  const renderSolicitud = ({ item }) => {
    const estado = item.estado || 'pendiente';
    const mascotaNombre =
      item.mascota_nombre || item.mascota?.nombre || item.mascotaNombre || 'Mascota';
    const adoptanteNombre =
      item.adoptante_nombre || item.adoptante?.nombre || item.adoptanteNombre || 'Adoptante';

    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={1}
        onPress={() =>
          router.push(`/(tabs)/solicitudes/${item.id_solicitud || item._id || item.id}`)
        }
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="file-document-edit"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.cardHeaderText}>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface, fontWeight: '600' }}
              >
                {rol === 'rescatista'
                  ? `Solicitud de ${adoptanteNombre}`
                  : `Solicitud para ${mascotaNombre}`}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {item.fecha
                  ? new Date(item.fecha || item.createdAt).toLocaleDateString('es-VE')
                  : 'Sin fecha'}
              </Text>
            </View>
            <Chip
              compact
              style={{
                backgroundColor: estadoSolicitudColors[estado] || '#9E9E9E',
              }}
              textStyle={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}
            >
              {estadoSolicitudLabels[estado] || estado}
            </Chip>
          </View>

          {item.motivo && (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
              numberOfLines={2}
            >
              {item.motivo}
            </Text>
          )}

          <View style={styles.cardFooter}>
            <Button
              mode="text"
              compact
              textColor={theme.colors.primary}
              onPress={() =>
                router.push(`/(tabs)/solicitudes/${item._id || item.id}`)
              }
            >
              Ver detalle →
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: rol === 'rescatista' ? 'Solicitudes Recibidas' : 'Mis Solicitudes',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      {error ? (
        <ErrorMessage message={error} onRetry={fetchSolicitudes} />
      ) : null}

      {solicitudes.length === 0 && !error ? (
        <EmptyState
          icon="file-document-outline"
          title="No hay solicitudes"
          message={
            rol === 'rescatista'
              ? 'Aún no has recibido solicitudes de adopción.'
              : 'Aún no has enviado solicitudes de adopción. Explora las mascotas disponibles.'
          }
          actionLabel={rol === 'adoptante' ? 'Ver mascotas' : undefined}
          onAction={
            rol === 'adoptante'
              ? () => router.push('/(tabs)/mascotas')
              : undefined
          }
        />
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderSolicitud}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});
