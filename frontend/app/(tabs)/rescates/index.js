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
  FAB,
  useTheme,
} from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import rescatesService from '../../../src/services/rescates.service';
import LoadingScreen from '../../../src/components/LoadingScreen';
import EmptyState from '../../../src/components/EmptyState';
import ErrorMessage from '../../../src/components/ErrorMessage';

export default function RescatesIndex() {
  const theme = useTheme();
  const router = useRouter();

  const [rescates, setRescates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRescates();
  }, []);

  const fetchRescates = async () => {
    try {
      setError('');
      const result = await rescatesService.listar();
      if (result.success) {
        const data = result.data;
        const list = Array.isArray(data) ? data : data.rescates || data.items || [];
        setRescates(list);
      } else {
        setError(result.message || 'Error al cargar rescates.');
      }
    } catch (err) {
      setError('Error al cargar rescates.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRescates();
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Rescates', headerShown: true }} />
        <LoadingScreen message="Cargando rescates..." />
      </>
    );
  }

  const renderRescate = ({ item }) => (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      elevation={1}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="hand-heart"
            size={24}
            color={theme.colors.primary}
          />
          <View style={styles.cardHeaderText}>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurface, fontWeight: '600' }}
            >
              {item.descripcion || 'Rescate registrado'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.fecha
                ? new Date(item.fecha).toLocaleDateString('es-VE')
                : 'Fecha no disponible'}
            </Text>
          </View>
          <Chip
            compact
            style={{ backgroundColor: theme.colors.secondaryContainer }}
            textStyle={{ color: theme.colors.onSecondaryContainer, fontSize: 11 }}
          >
            {item.estado || 'Registrado'}
          </Chip>
        </View>

        {item.ubicacion && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.ubicacion}
            </Text>
          </View>
        )}

        {item.mascota && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="paw"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Mascota: {item.mascota.nombre || item.mascota}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Rescates',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      {error ? (
        <ErrorMessage message={error} onRetry={fetchRescates} />
      ) : null}

      {rescates.length === 0 && !error ? (
        <EmptyState
          icon="hand-heart-outline"
          title="No hay rescates registrados"
          message="Registra tu primer rescate para comenzar."
          actionLabel="Registrar rescate"
          onAction={() => router.push('/(tabs)/rescates/nuevo')}
        />
      ) : (
        <FlatList
          data={rescates}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderRescate}
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

      <FAB
        icon="plus"
        label="Nuevo rescate"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/(tabs)/rescates/nuevo')}
      />
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
});
