import React, { useState } from 'react';
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
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import rescatesService from '../../../src/services/rescates.service';

export default function NuevoRescate() {
  const theme = useTheme();
  const router = useRouter();

  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [condicion, setCondicion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!descripcion.trim()) {
      setError('La descripción del rescate es requerida.');
      return;
    }
    if (!ubicacion.trim()) {
      setError('La ubicación es requerida.');
      return;
    }

    setLoading(true);
    try {
      const rescateData = {
        descripcion: descripcion.trim(),
        ubicacion: ubicacion.trim(),
        condicion: condicion.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
      };

      const result = await rescatesService.crear(rescateData);
      if (result.success) {
        setSnackMessage('¡Rescate registrado exitosamente!');
        setSnackVisible(true);
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setError(result.message || 'Error al registrar el rescate.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar el rescate.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Registrar Rescate',
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
                  name="hand-heart"
                  size={40}
                  color={theme.colors.primary}
                />
                <Text
                  variant="titleLarge"
                  style={[styles.title, { color: theme.colors.onSurface }]}
                >
                  Nuevo Rescate
                </Text>
              </View>

              {error ? (
                <View
                  style={[
                    styles.errorBox,
                    { backgroundColor: theme.colors.errorContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={20}
                    color={theme.colors.error}
                  />
                  <Text style={{ color: theme.colors.error, flex: 1 }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <TextInput
                label="Descripción del rescate *"
                value={descripcion}
                onChangeText={setDescripcion}
                mode="outlined"
                multiline
                numberOfLines={4}
                left={<TextInput.Icon icon="text" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
              />

              <TextInput
                label="Ubicación *"
                value={ubicacion}
                onChangeText={setUbicacion}
                mode="outlined"
                left={<TextInput.Icon icon="map-marker" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
                placeholder="Ej: Av. 5 de Julio, Maracaibo"
              />

              <TextInput
                label="Condición del animal"
                value={condicion}
                onChangeText={setCondicion}
                mode="outlined"
                left={<TextInput.Icon icon="heart-pulse" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
                placeholder="Ej: Desnutrido, herido, buen estado"
              />

              <TextInput
                label="Observaciones adicionales"
                value={observaciones}
                onChangeText={setObservaciones}
                mode="outlined"
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="note-text" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                contentStyle={styles.submitContent}
                buttonColor={theme.colors.primary}
                icon="check"
              >
                {loading ? 'Registrando...' : 'Registrar Rescate'}
              </Button>

              <Button
                mode="text"
                onPress={() => router.back()}
                disabled={loading}
                textColor={theme.colors.onSurfaceVariant}
                style={styles.cancelButton}
              >
                Cancelar
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>

        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={2000}
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
    maxWidth: 600,
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
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  submitContent: {
    paddingVertical: 6,
  },
  cancelButton: {
    marginTop: 8,
  },
});
