import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  TextInput,
  Divider,
  useTheme,
  Snackbar,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import solicitudesService from '../../../src/services/solicitudes.service';
import { useAuth } from '../../../src/hooks/useAuth';
import LoadingScreen from '../../../src/components/LoadingScreen';
import ErrorMessage from '../../../src/components/ErrorMessage';

const estadoColors = {
  pendiente: '#FF9800',
  aprobada: '#4CAF50',
  rechazada: '#F44336',
  en_revision: '#2196F3',
};

const estadoLabels = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  en_revision: 'En revisión',
};

export default function SolicitudDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const rol = user?.rol?.toLowerCase() || '';

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Evaluación (rescatista)
  const [evalDialog, setEvalDialog] = useState(false);
  const [evalEstado, setEvalEstado] = useState('aprobada');
  const [evalComentarios, setEvalComentarios] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);

  // Cita
  const [citaDialog, setCitaDialog] = useState(false);
  const [citaFecha, setCitaFecha] = useState('');
  const [citaHora, setCitaHora] = useState('');
  const [citaLugar, setCitaLugar] = useState('');
  const [citaNotas, setCitaNotas] = useState('');
  const [citaLoading, setCitaLoading] = useState(false);

  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  useEffect(() => {
    fetchSolicitud();
  }, [id]);

  const fetchSolicitud = async () => {
    try {
      setLoading(true);
      setError('');
      try {
        const directResult = await solicitudesService.obtener(id);
        if (directResult.success && directResult.data) {
          setSolicitud(directResult.data);
          return;
        }
      } catch (e) {
        // Fallback a listar
      }
      const result = await solicitudesService.listar();
      if (result.success) {
        const data = result.data;
        const list = Array.isArray(data) ? data : data.solicitudes || data.items || [];
        const found = list.find(
          (s) => String(s.id_solicitud || s._id || s.id) === String(id)
        );
        if (found) {
          setSolicitud(found);
        } else {
          setError('Solicitud no encontrada.');
        }
      } else {
        setError(result.message || 'Error al cargar solicitud.');
      }
    } catch (err) {
      setError('Error al cargar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluar = async () => {
    setEvalLoading(true);
    try {
      const result = await solicitudesService.evaluar(id, {
        estado: evalEstado,
        comentarios: evalComentarios.trim(),
      });
      if (result.success) {
        setEvalDialog(false);
        setSnackMessage(
          evalEstado === 'aprobada'
            ? '¡Solicitud aprobada exitosamente!'
            : 'Solicitud rechazada.'
        );
        setSnackVisible(true);
        fetchSolicitud();
      } else {
        setSnackMessage(result.message || 'Error al evaluar.');
        setSnackVisible(true);
      }
    } catch (err) {
      setSnackMessage(err.response?.data?.message || 'Error al evaluar la solicitud.');
      setSnackVisible(true);
    } finally {
      setEvalLoading(false);
    }
  };

  const handleAgendarCita = async () => {
    if (!citaFecha || !citaHora || !citaLugar) {
      setSnackMessage('Fecha, hora y lugar son requeridos.');
      setSnackVisible(true);
      return;
    }

    setCitaLoading(true);
    try {
      const result = await solicitudesService.agendarCita(id, {
        fecha: citaFecha,
        hora: citaHora,
        lugar: citaLugar.trim(),
        notas: citaNotas.trim(),
      });
      if (result.success) {
        setCitaDialog(false);
        setSnackMessage('¡Cita agendada exitosamente!');
        setSnackVisible(true);
        fetchSolicitud();
      } else {
        setSnackMessage(result.message || 'Error al agendar cita.');
        setSnackVisible(true);
      }
    } catch (err) {
      setSnackMessage(err.response?.data?.message || 'Error al agendar la cita.');
      setSnackVisible(true);
    } finally {
      setCitaLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Solicitud', headerShown: true }} />
        <LoadingScreen message="Cargando solicitud..." />
      </>
    );
  }

  if (error || !solicitud) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error', headerShown: true }} />
        <ErrorMessage message={error || 'No encontrada.'} onRetry={fetchSolicitud} />
      </>
    );
  }

  const estado = solicitud.estado || 'pendiente';
  const canEvaluate = rol === 'rescatista' && estado === 'pendiente';
  const canSchedule = estado === 'aprobada';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Detalle de Solicitud',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        >
          <Card.Content>
            {/* Estado */}
            <View style={styles.statusRow}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                Solicitud de Adopción
              </Text>
              <Chip
                style={{ backgroundColor: estadoColors[estado] || '#9E9E9E' }}
                textStyle={{ color: '#FFF', fontWeight: '600' }}
              >
                {estadoLabels[estado] || estado}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            {/* Info de la mascota */}
            <InfoRow
              icon="paw"
              label="Mascota"
              value={solicitud.mascota?.nombre || 'No especificada'}
              color={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            {/* Info del adoptante */}
            <InfoRow
              icon="account"
              label="Adoptante"
              value={solicitud.adoptante?.nombre || solicitud.adoptanteNombre || 'No especificado'}
              color={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            {/* Motivo */}
            {solicitud.motivo && (
              <InfoRow
                icon="text-box"
                label="Motivo"
                value={solicitud.motivo}
                color={theme.colors.primary}
                textColor={theme.colors.onSurface}
              />
            )}

            {/* Experiencia */}
            {solicitud.experiencia && (
              <InfoRow
                icon="heart"
                label="Experiencia"
                value={solicitud.experiencia}
                color={theme.colors.primary}
                textColor={theme.colors.onSurface}
              />
            )}

            {/* Fecha */}
            <InfoRow
              icon="calendar"
              label="Fecha"
              value={
                solicitud.fecha || solicitud.createdAt
                  ? new Date(solicitud.fecha || solicitud.createdAt).toLocaleDateString('es-VE')
                  : 'No disponible'
              }
              color={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            {/* Comentarios de evaluación */}
            {solicitud.comentarios && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600', marginBottom: 4 }}>
                  Comentarios del evaluador
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {solicitud.comentarios}
                </Text>
              </>
            )}

            {/* Citas */}
            {solicitud.citas && solicitud.citas.length > 0 && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600', marginBottom: 8 }}>
                  Citas agendadas
                </Text>
                {solicitud.citas.map((cita, index) => (
                  <Card key={index} style={[styles.citaCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Card.Content>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                        📅 {cita.fecha} a las {cita.hora}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        📍 {cita.lugar}
                      </Text>
                      {cita.notas && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          📝 {cita.notas}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </>
            )}

            <Divider style={styles.divider} />

            {/* Acciones */}
            <View style={styles.actions}>
              {canEvaluate && (
                <Button
                  mode="contained"
                  icon="check-decagram"
                  onPress={() => setEvalDialog(true)}
                  buttonColor={theme.colors.primary}
                  style={styles.actionBtn}
                  contentStyle={styles.actionBtnContent}
                >
                  Evaluar Solicitud
                </Button>
              )}

              {canSchedule && (
                <Button
                  mode="outlined"
                  icon="calendar-plus"
                  onPress={() => setCitaDialog(true)}
                  textColor={theme.colors.secondary}
                  style={styles.actionBtn}
                >
                  Agendar Cita
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Dialog de evaluación */}
      <Portal>
        <Dialog
          visible={evalDialog}
          onDismiss={() => setEvalDialog(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Evaluar Solicitud
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              Selecciona el resultado de la evaluación:
            </Text>
            <RadioButton.Group onValueChange={setEvalEstado} value={evalEstado}>
              <RadioButton.Item
                label="Aprobar adopción"
                value="aprobada"
                color={theme.colors.secondary}
              />
              <RadioButton.Item
                label="Rechazar solicitud"
                value="rechazada"
                color={theme.colors.error}
              />
            </RadioButton.Group>
            <TextInput
              label="Comentarios"
              value={evalComentarios}
              onChangeText={setEvalComentarios}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginTop: 12 }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEvalDialog(false)} textColor={theme.colors.onSurfaceVariant}>
              Cancelar
            </Button>
            <Button
              onPress={handleEvaluar}
              loading={evalLoading}
              disabled={evalLoading}
              textColor={evalEstado === 'aprobada' ? theme.colors.secondary : theme.colors.error}
            >
              {evalEstado === 'aprobada' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Dialog de cita */}
        <Dialog
          visible={citaDialog}
          onDismiss={() => setCitaDialog(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Agendar Cita
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Fecha (DD/MM/AAAA)"
              value={citaFecha}
              onChangeText={setCitaFecha}
              mode="outlined"
              left={<TextInput.Icon icon="calendar" />}
              style={styles.dialogInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              placeholder="Ej: 25/12/2024"
            />
            <TextInput
              label="Hora"
              value={citaHora}
              onChangeText={setCitaHora}
              mode="outlined"
              left={<TextInput.Icon icon="clock" />}
              style={styles.dialogInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              placeholder="Ej: 10:00 AM"
            />
            <TextInput
              label="Lugar"
              value={citaLugar}
              onChangeText={setCitaLugar}
              mode="outlined"
              left={<TextInput.Icon icon="map-marker" />}
              style={styles.dialogInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            <TextInput
              label="Notas adicionales"
              value={citaNotas}
              onChangeText={setCitaNotas}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.dialogInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCitaDialog(false)} textColor={theme.colors.onSurfaceVariant}>
              Cancelar
            </Button>
            <Button
              onPress={handleAgendarCita}
              loading={citaLoading}
              disabled={citaLoading}
              textColor={theme.colors.primary}
            >
              Agendar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {snackMessage}
      </Snackbar>
    </View>
  );
}

function InfoRow({ icon, label, value, color, textColor }) {
  return (
    <View style={infoStyles.row}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <View style={infoStyles.textCol}>
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

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
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
  },
  card: {
    borderRadius: 16,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  divider: {
    marginVertical: 16,
  },
  citaCard: {
    borderRadius: 8,
    marginBottom: 8,
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    borderRadius: 8,
  },
  actionBtnContent: {
    paddingVertical: 6,
  },
  dialogInput: {
    marginBottom: 12,
  },
});
