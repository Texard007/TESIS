import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { Text, Button, FAB, useTheme } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import mascotasService from '../../../src/services/mascotas.service';
import { useAuth } from '../../../src/hooks/useAuth';
import PetCard from '../../../src/components/PetCard';
import FilterBar from '../../../src/components/FilterBar';
import LoadingScreen from '../../../src/components/LoadingScreen';
import EmptyState from '../../../src/components/EmptyState';
import ErrorMessage from '../../../src/components/ErrorMessage';

export default function MascotasIndex() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const rol = user?.rol?.toLowerCase() || '';

  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [especieFilter, setEspecieFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 680 && width < 1024;
  const numColumns = isDesktop ? 3 : (isTablet ? 2 : 1);

  const canCreate = rol === 'rescatista' || rol === 'veterinario' || rol === 'administrador' || rol === 'admin';

  const fetchMascotas = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        setError('');

        const params = { page: pageNum, limit: 12 };
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (especieFilter) params.especie = especieFilter;
        if (estadoFilter) params.estado = estadoFilter;

        const result = await mascotasService.listar(params);
        if (result.success) {
          const data = result.data;
          const list = Array.isArray(data) ? data : data.mascotas || data.items || [];
          const total = data.totalPages || data.pages || Math.ceil((data.total || list.length) / 12);

          if (append) {
            setMascotas((prev) => [...prev, ...list]);
          } else {
            setMascotas(list);
          }
          setTotalPages(total);
          setPage(pageNum);
        } else {
          setError(result.message || 'Error al cargar mascotas.');
        }
      } catch (err) {
        setError('Error al cargar mascotas. Verifica tu conexión.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, especieFilter, estadoFilter]
  );

  useEffect(() => {
    fetchMascotas(1);
  }, [fetchMascotas]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMascotas(1);
  };

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      setLoadingMore(true);
      fetchMascotas(page + 1, true);
    }
  };

  const handlePetPress = (mascota) => {
    router.push(`/(tabs)/mascotas/${mascota.id_mascota || mascota.id || mascota._id}`);
  };

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMascotas(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading && mascotas.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Mascotas', headerShown: true }} />
        <LoadingScreen message="Cargando mascotas..." />
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Mascotas',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        especieFilter={especieFilter}
        onEspecieChange={(val) => {
          setEspecieFilter(val);
        }}
        estadoFilter={estadoFilter}
        onEstadoChange={(val) => {
          setEstadoFilter(val);
        }}
      />

      {error ? (
        <ErrorMessage message={error} onRetry={() => fetchMascotas(1)} />
      ) : null}

      {mascotas.length === 0 && !loading ? (
        <EmptyState
          icon="paw-off"
          title="No se encontraron mascotas"
          message="Intenta cambiar los filtros o busca con otros términos."
          actionLabel="Limpiar filtros"
          onAction={() => {
            setSearchQuery('');
            setEspecieFilter('');
            setEstadoFilter('');
          }}
        />
      ) : (
        <FlatList
          data={mascotas}
          keyExtractor={(item) => String(item.id_mascota || item._id || item.id || Math.random())}
          renderItem={({ item }) => (
            <PetCard mascota={item} onPress={handlePetPress} />
          )}
          numColumns={numColumns}
          key={`cols-${numColumns}`}
          contentContainerStyle={styles.list}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <Button loading disabled mode="text">
                  Cargando más...
                </Button>
              </View>
            ) : page < totalPages ? (
              <View style={styles.footer}>
                <Button mode="outlined" onPress={loadMore} textColor={theme.colors.primary}>
                  Cargar más
                </Button>
              </View>
            ) : null
          }
        />
      )}

      {canCreate && (
        <FAB
          icon="plus"
          label="Nueva mascota"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => router.push('/(tabs)/mascotas/nueva')}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  row: {
    justifyContent: 'flex-start',
    gap: 12,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 16,
    elevation: 4,
  },
});
