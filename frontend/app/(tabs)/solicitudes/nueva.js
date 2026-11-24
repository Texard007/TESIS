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
  Button,
  TextInput,
  Card,
  useTheme,
  Chip,
  Divider,
  Switch,
  Snackbar,
  SegmentedButtons,
  HelperText,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import solicitudesService from '../../../src/services/solicitudes.service';
import { useAuth } from '../../../src/hooks/useAuth';

const TIPO_VIVIENDA = [
  { value: 'casa_patio', label: 'Casa con patio' },
  { value: 'casa_sin_patio', label: 'Casa sin patio' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'finca', label: 'Finca/Campo' },
];

const EXPERIENCIA_MASCOTAS = [
  { value: 'ninguna', label: 'Sin experiencia' },
  { value: 'basica', label: 'Básica' },
  { value: 'intermedia', label: 'Intermedia' },
  { value: 'avanzada', label: 'Avanzada' },
];

export default function NuevaSolicitudScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // Parámetros que pueden venir de la pantalla de mascota
  const { mascotaId, mascotaNombre } = useLocalSearchParams();

  // Datos personales del adoptante
  const [ingresos, setIngresos] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [numPersonas, setNumPersonas] = useState('');
  const [tieneNinos, setTieneNinos] = useState(false);
  const [tieneOtrosPets, setTieneOtrosPets] = useState(false);

  // Vivienda
  const [tipoVivienda, setTipoVivienda] = useState('');
  const [tieneEspacio, setTieneEspacio] = useState(false);

  // Motivación
  const [motivo, setMotivo] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [compromiso, setCompromiso] = useState('');

  // Estado del form
  const [saving, setSaving] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const tabs = ['Datos Personales', 'Vivienda', 'Motivación'];

  const handleSubmit = async () => {
    if (!motivo.trim()) {
      setSnackMessage('Por favor escribe tu motivación para adoptar.');
      setSnackVisible(true);
      return;
    }
    if (!tipoVivienda) {
      setSnackMessage('Selecciona el tipo de vivienda.');
      setSnackVisible(true);
      setCurrentTab(1);
      return;
    }

    setSaving(true);
    try {
      const solicitudData = {
        id_mascota: mascotaId ? parseInt(mascotaId) : null,
        mascota_nombre: mascotaNombre || null,
        datos_formulario: {
          motivo: motivo.trim(),
          experiencia_mascotas: experiencia,
          tipo_vivienda: tipoVivienda,
          num_personas_hogar: numPersonas ? parseInt(numPersonas) : undefined,
          tiene_ninos: tieneNinos,
          tiene_otras_mascotas: tieneOtrosPets,
          tiene_espacio_exterior: tieneEspacio,
          ocupacion: ocupacion.trim() || undefined,
          ingresos_aproximados: ingresos.trim() || undefined,
          compromiso: compromiso.trim() || undefined,
        },
      };

      const result = await solicitudesService.crear(solicitudData);
      if (result.success) {
        setSnackMessage('¡Solicitud de adopción enviada exitosamente!');
        setSnackVisible(true);
        setTimeout(() => {
          router.back();
        }, 1800);
      } else {
        setSnackMessage(result.message || 'Error al enviar la solicitud.');
        setSnackVisible(true);
      }
    } catch (err) {
      setSnackMessage('Error al enviar la solicitud. Intenta de nuevo.');
      setSnackVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ icon, title, color }) => (
    <View style={[styles.sectionHeader, { borderLeftColor: color || theme.colors.primary }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color || theme.colors.primary} />
      <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
        {title}
      </Text>
    </View>
  );

  const SwitchRow = ({ label, value, onChange, icon }) => (
    <View style={styles.switchRow}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onChange} color={theme.colors.primary} />
    </View>
  );

  const renderTab = () => {
    if (currentTab === 0) {
      return (
        <>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Card.Content>
              <SectionHeader icon="account" title="Información Personal" color="#1565C0" />

              <TextInput
                label="Ocupación / Profesión"
                value={ocupacion}
                onChangeText={setOcupacion}
                mode="outlined"
                left={<TextInput.Icon icon="briefcase" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={saving}
              />

              <TextInput
                label="Ingresos aproximados (Bs. o USD)"
                value={ingresos}
                onChangeText={setIngresos}
                mode="outlined"
                left={<TextInput.Icon icon="currency-usd" />}
                keyboardType="default"
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={saving}
                placeholder="Ej: 300 USD mensuales"
              />
              <HelperText type="info">
                Esta información es confidencial y ayuda a evaluar la solicitud.
              </HelperText>

              <TextInput
                label="Número de personas en el hogar"
                value={numPersonas}
                onChangeText={setNumPersonas}
                mode="outlined"
                left={<TextInput.Icon icon="account-group" />}
                keyboardType="numeric"
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={saving}
              />

              <Divider style={styles.divider} />

              <SwitchRow
                label="¿Hay niños menores de 12 años en el hogar?"
                value={tieneNinos}
                onChange={setTieneNinos}
                icon="baby-face-outline"
              />
              <SwitchRow
                label="¿Tiene otras mascotas actualmente?"
                value={tieneOtrosPets}
                onChange={setTieneOtrosPets}
                icon="paw"
              />
            </Card.Content>
          </Card>
        </>
      );
    }

    if (currentTab === 1) {
      return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Card.Content>
            <SectionHeader icon="home" title="Condiciones de Vivienda" color="#2E7D32" />

            <Text variant="labelLarge" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
              Tipo de vivienda *
            </Text>
            <View style={styles.chipsRow}>
              {TIPO_VIVIENDA.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={tipoVivienda === opt.value}
                  onPress={() => setTipoVivienda(opt.value)}
                  style={[
                    styles.chip,
                    tipoVivienda === opt.value && { backgroundColor: theme.colors.primaryContainer },
                  ]}
                  textStyle={
                    tipoVivienda === opt.value
                      ? { color: theme.colors.onPrimaryContainer, fontWeight: '600' }
                      : { color: theme.colors.onSurfaceVariant }
                  }
                  showSelectedOverlay
                >
                  {opt.label}
                </Chip>
              ))}
            </View>

            <Divider style={styles.divider} />

            <SwitchRow
              label="¿Cuenta con espacio exterior seguro (patio cerrado, jardín)?"
              value={tieneEspacio}
              onChange={setTieneEspacio}
              icon="fence"
            />
          </Card.Content>
        </Card>
      );
    }

    // Tab 2: Motivación
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Card.Content>
          <SectionHeader icon="heart" title="Motivación y Experiencia" color="#C62828" />

          <Text variant="labelLarge" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
            Experiencia previa con mascotas
          </Text>
          <View style={styles.chipsRow}>
            {EXPERIENCIA_MASCOTAS.map((opt) => (
              <Chip
                key={opt.value}
                selected={experiencia === opt.value}
                onPress={() => setExperiencia(opt.value)}
                style={[
                  styles.chip,
                  experiencia === opt.value && { backgroundColor: theme.colors.secondaryContainer },
                ]}
                textStyle={
                  experiencia === opt.value
                    ? { color: theme.colors.onSecondaryContainer, fontWeight: '600' }
                    : { color: theme.colors.onSurfaceVariant }
                }
                showSelectedOverlay
              >
                {opt.label}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <TextInput
            label="¿Por qué deseas adoptar esta mascota? *"
            value={motivo}
            onChangeText={setMotivo}
            mode="outlined"
            multiline
            numberOfLines={5}
            left={<TextInput.Icon icon="text-box" />}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            disabled={saving}
            placeholder="Cuéntanos sobre tu hogar, rutinas, y por qué crees que eres el adoptante ideal..."
          />

          <TextInput
            label="Compromiso de cuidado a largo plazo"
            value={compromiso}
            onChangeText={setCompromiso}
            mode="outlined"
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="handshake" />}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            disabled={saving}
            placeholder="Describe cómo te comprometes con el bienestar de la mascota..."
          />

          {/* Aviso legal */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.secondaryContainer }]}>
            <MaterialCommunityIcons name="information" size={18} color={theme.colors.secondary} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer, flex: 1 }}>
              Al enviar esta solicitud, aceptas ser evaluado por el equipo de rescatistas. 
              La decisión final es de la organización rescatadora.
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen
          options={{
            title: mascotaNombre ? `Adoptar a ${mascotaNombre}` : 'Solicitud de Adopción',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.primary,
          }}
        />

        {/* Banner de mascota si viene con nombre */}
        {mascotaNombre && (
          <View style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="paw" size={22} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '600' }}>
              Solicitud para adoptar a: {mascotaNombre}
            </Text>
          </View>
        )}

        {/* Tab nav */}
        <View style={[styles.tabRow, { borderBottomColor: theme.colors.outlineVariant }]}>
          {tabs.map((tab, i) => (
            <View
              key={tab}
              style={[
                styles.tabItem,
                i === currentTab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2.5 },
              ]}
            >
              <Text
                variant="labelMedium"
                onPress={() => setCurrentTab(i)}
                style={{
                  color: i === currentTab ? theme.colors.primary : theme.colors.onSurfaceVariant,
                  fontWeight: i === currentTab ? '700' : '400',
                }}
              >
                {tab}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {renderTab()}

          {/* Navegación entre tabs */}
          <View style={styles.navRow}>
            {currentTab > 0 && (
              <Button
                mode="outlined"
                onPress={() => setCurrentTab((t) => t - 1)}
                style={styles.navBtn}
                textColor={theme.colors.primary}
                icon="arrow-left"
              >
                Anterior
              </Button>
            )}
            {currentTab < tabs.length - 1 ? (
              <Button
                mode="contained"
                onPress={() => setCurrentTab((t) => t + 1)}
                style={[styles.navBtn, { flex: 1 }]}
                buttonColor={theme.colors.primary}
                icon="arrow-right"
                contentStyle={{ flexDirection: 'row-reverse' }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={saving}
                disabled={saving}
                style={[styles.navBtn, { flex: 1 }]}
                buttonColor={theme.colors.secondary}
                icon="send"
                contentStyle={styles.saveContent}
              >
                {saving ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            )}
          </View>
        </ScrollView>

        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={3000}
          action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
        >
          {snackMessage}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 12, marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    paddingLeft: 10,
  },
  input: { marginBottom: 8 },
  fieldLabel: { marginBottom: 8, marginTop: 4, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { marginBottom: 2 },
  divider: { marginVertical: 14 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    marginBottom: 4,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  navBtn: { borderRadius: 8 },
  saveContent: { paddingVertical: 6 },
});
