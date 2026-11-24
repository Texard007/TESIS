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
  Divider,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import expedientesService from '../../../src/services/expedientes.service';
import LoadingScreen from '../../../src/components/LoadingScreen';
import ErrorMessage from '../../../src/components/ErrorMessage';

export default function ExpedienteScreen() {
  const theme = useTheme();
  const { mascotaId } = useLocalSearchParams();

  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNew, setIsNew] = useState(false);

  // Campos del formulario
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [vacunas, setVacunas] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [peso, setPeso] = useState('');
  const [temperatura, setTemperatura] = useState('');

  const [saving, setSaving] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  useEffect(() => {
    fetchExpediente();
  }, [mascotaId]);

  const fetchExpediente = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await expedientesService.obtener(mascotaId);
      if (result.success && result.data) {
        const raw = result.data;
        const exp = Array.isArray(raw) ? raw[0] : raw;
        if (exp) {
          setExpediente(exp);
          setDiagnostico(exp.diagnostico || '');
          setTratamiento(exp.tratamientos || exp.tratamiento || '');
          setVacunas(
            Array.isArray(exp.vacunas)
              ? exp.vacunas.map(v => typeof v === 'object' ? (v.nombre || JSON.stringify(v)) : v).join(', ')
              : (typeof exp.vacunas === 'string' ? exp.vacunas : '')
          );
          setObservaciones(exp.observaciones || '');
          setPeso(exp.peso ? String(exp.peso) : '');
          setTemperatura(exp.temperatura ? String(exp.temperatura) : '');
          setIsNew(false);
        } else {
          setIsNew(true);
          setExpediente(null);
        }
      } else {
        // No tiene expediente aún
        setIsNew(true);
        setExpediente(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setIsNew(true);
        setExpediente(null);
      } else {
        setError('Error al cargar expediente médico.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!diagnostico.trim()) {
      setSnackMessage('El diagnóstico es requerido.');
      setSnackVisible(true);
      return;
    }

    setSaving(true);
    try {
      const expData = {
        diagnostico: diagnostico.trim(),
        tratamiento: tratamiento.trim() || undefined,
        vacunas: vacunas
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        observaciones: observaciones.trim() || undefined,
        peso: peso ? parseFloat(peso) : undefined,
        temperatura: temperatura ? parseFloat(temperatura) : undefined,
      };

      let result;
      if (isNew) {
        result = await expedientesService.crear(mascotaId, expData);
      } else {
        const expId = expediente.id_expediente || expediente._id || expediente.id;
        result = await expedientesService.actualizar(expId, expData);
      }

      if (result.success) {
        setSnackMessage(
          isNew
            ? '¡Expediente creado exitosamente!'
            : '¡Expediente actualizado exitosamente!'
        );
        setSnackVisible(true);
        setIsNew(false);
        if (result.data) setExpediente(result.data);
      } else {
        setSnackMessage(result.message || 'Error al guardar expediente.');
        setSnackVisible(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar expediente.';
      setSnackMessage(msg);
      setSnackVisible(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Expediente', headerShown: true }} />
        <LoadingScreen message="Cargando expediente..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error', headerShown: true }} />
        <ErrorMessage message={error} onRetry={fetchExpediente} />
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen
          options={{
            title: isNew ? 'Crear Expediente' : 'Expediente Médico',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.primary,
          }}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            elevation={2}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.iconRow}>
                <MaterialCommunityIcons
                  name="medical-bag"
                  size={36}
                  color={theme.colors.secondary}
                />
                <Text
                  variant="titleLarge"
                  style={{ color: theme.colors.onSurface, fontWeight: '700' }}
                >
                  {isNew ? 'Nuevo Expediente' : 'Expediente Médico'}
                </Text>
              </View>

              {isNew && (
                <View
                  style={[
                    styles.infoBox,
                    { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color={theme.colors.secondary}
                  />
                  <Text style={{ color: theme.colors.onSecondaryContainer, flex: 1 }}>
                    Esta mascota aún no tiene expediente médico. Completa los datos para crear uno.
                  </Text>
                </View>
              )}

              <Divider style={styles.divider} />

              {/* Signos vitales */}
              <Text
                variant="labelLarge"
                style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
              >
                Signos vitales
              </Text>

              <View style={styles.row}>
                <TextInput
                  label="Peso (kg)"
                  value={peso}
                  onChangeText={setPeso}
                  mode="outlined"
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="weight" />}
                  style={[styles.input, styles.halfInput]}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  disabled={saving}
                />
                <TextInput
                  label="Temperatura (°C)"
                  value={temperatura}
                  onChangeText={setTemperatura}
                  mode="outlined"
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="thermometer" />}
                  style={[styles.input, styles.halfInput]}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  disabled={saving}
                />
              </View>

              <Divider style={styles.divider} />

              {/* Diagnóstico y tratamiento */}
              <Text
                variant="labelLarge"
                style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
              >
                Diagnóstico y tratamiento
              </Text>

              <TextInput
                label="Diagnóstico *"
                value={diagnostico}
                onChangeText={setDiagnostico}
                mode="outlined"
                multiline
                numberOfLines={4}
                left={<TextInput.Icon icon="stethoscope" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={saving}
              />

              <TextInput
                label="Tratamiento"
                value={tratamiento}
                onChangeText={setTratamiento}
                mode="outlined"
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="pill" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={saving}
              />

              <TextInput
                label="Vacunas (separadas por coma)"
                value={vacunas}
                onChangeText={setVacunas}
                mode="outlined"
                left={<TextInput.Icon icon="needle" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={saving}
                placeholder="Ej: Rabia, Parvovirus, Moquillo"
              />

              <TextInput
                label="Observaciones"
                value={observaciones}
                onChangeText={setObservaciones}
                mode="outlined"
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="note-text" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={saving}
              />

              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={styles.saveButton}
                contentStyle={styles.saveContent}
                buttonColor={theme.colors.secondary}
                icon={isNew ? 'plus' : 'content-save'}
              >
                {saving
                  ? 'Guardando...'
                  : isNew
                  ? 'Crear Expediente'
                  : 'Actualizar Expediente'}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>

        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={3000}
        >
          {snackMessage}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
}

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
  cardContent: {
    padding: 24,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  saveContent: {
    paddingVertical: 6,
  },
});
