import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Divider,
} from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import adminService from '../../../src/services/admin.service';
import LoadingScreen from '../../../src/components/LoadingScreen';
import ErrorMessage from '../../../src/components/ErrorMessage';

export default function AdminIndex() {
  const theme = useTheme();
  const router = useRouter();

  const [reportes, setReportes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const { width } = Dimensions.get('window');
  const isWide = width > 768;

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      setError('');
      const result = await adminService.obtenerReportes();
      if (result.success) {
        setReportes(result.data);
      } else {
        setError(result.message || 'Error al cargar reportes.');
      }
    } catch (err) {
      setError('Error al cargar reportes del sistema.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Panel Admin', headerShown: true }} />
        <LoadingScreen message="Cargando reportes..." />
      </>
    );
  }

  // Datos de estadísticas (mapeo adaptativo para backend)
  const stats = reportes || {};
  const totalMascotas = stats.mascotas?.total || stats.totalMascotas || stats.mascotas || 0;
  const totalUsuarios = stats.usuarios?.total || stats.totalUsuarios || stats.usuarios || 0;
  const totalRescates = stats.rescates?.total || stats.totalRescates || stats.rescates || 0;
  const adopcionesCompletadas = stats.mascotas?.por_estado?.adoptada || stats.solicitudes?.por_estado?.aprobada || stats.adopcionesCompletadas || 0;
  const solicitudesPendientes = stats.solicitudes?.por_estado?.pendiente || stats.solicitudesPendientes || 0;
  const totalSolicitudes = (stats.solicitudes?.por_estado ? Object.values(stats.solicitudes.por_estado).reduce((a, b) => a + b, 0) : 0) || stats.totalSolicitudes || 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Panel de Administración',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReportes();
            }}
            colors={[theme.colors.primary]}
          />
        }
      >
        {error ? (
          <ErrorMessage message={error} onRetry={fetchReportes} />
        ) : null}

        {/* Título de sección */}
        <Text
          variant="titleLarge"
          style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        >
          Resumen del Sistema
        </Text>

        {/* Grid de estadísticas */}
        <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
          <StatCard
            icon="paw"
            title="Mascotas"
            value={totalMascotas}
            color="#E65100"
            bgColor="#FFF3E0"
            theme={theme}
          />
          <StatCard
            icon="account-group"
            title="Usuarios"
            value={totalUsuarios}
            color="#1565C0"
            bgColor="#E3F2FD"
            theme={theme}
          />
          <StatCard
            icon="file-document-edit"
            title="Solicitudes"
            value={totalSolicitudes}
            color="#6A1B9A"
            bgColor="#F3E5F5"
            theme={theme}
          />
          <StatCard
            icon="hand-heart"
            title="Rescates"
            value={totalRescates}
            color="#2E7D32"
            bgColor="#E8F5E9"
            theme={theme}
          />
          <StatCard
            icon="heart-circle"
            title="Adopciones"
            value={adopcionesCompletadas}
            color="#C62828"
            bgColor="#FFEBEE"
            theme={theme}
          />
          <StatCard
            icon="clock-outline"
            title="Pendientes"
            value={solicitudesPendientes}
            color="#F57F17"
            bgColor="#FFFDE7"
            theme={theme}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Acceso rápido */}
        <Text
          variant="titleLarge"
          style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        >
          Gestión
        </Text>

        <Card
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        >
          <Card.Content style={styles.quickActions}>
            <Button
              mode="contained"
              icon="account-cog"
              onPress={() => router.push('/(tabs)/admin/usuarios')}
              buttonColor={theme.colors.primary}
              style={styles.quickBtn}
              contentStyle={styles.quickBtnContent}
            >
              Gestionar Usuarios
            </Button>

            <Button
              mode="outlined"
              icon="refresh"
              onPress={fetchReportes}
              textColor={theme.colors.primary}
              style={styles.quickBtn}
            >
              Actualizar Reportes
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, title, value, color, bgColor, theme }) {
  return (
    <Card style={[statStyles.card, { backgroundColor: bgColor }]} elevation={0}>
      <Card.Content style={statStyles.content}>
        <MaterialCommunityIcons name={icon} size={32} color={color} />
        <Text variant="headlineMedium" style={[statStyles.value, { color }]}>
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {title}
        </Text>
      </Card.Content>
    </Card>
  );
}

const statStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    minWidth: 140,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  value: {
    fontWeight: '700',
    marginTop: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsGridWide: {
    gap: 16,
  },
  divider: {
    marginVertical: 24,
  },
  card: {
    borderRadius: 16,
  },
  quickActions: {
    gap: 12,
    padding: 16,
  },
  quickBtn: {
    borderRadius: 8,
  },
  quickBtnContent: {
    paddingVertical: 6,
  },
});
