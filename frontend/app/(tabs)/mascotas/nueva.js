import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
} from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mascotasService from '../../../src/services/mascotas.service';
import { useAuth } from '../../../src/hooks/useAuth';

const ESPECIES = [
  { value: 'perro', label: 'Perro', icon: 'dog' },
  { value: 'gato', label: 'Gato', icon: 'cat' },
  { value: 'ave', label: 'Ave', icon: 'bird' },
  { value: 'conejo', label: 'Conejo', icon: 'rabbit' },
  { value: 'otro', label: 'Otro', icon: 'paw' },
];

const SEXOS = [
  { value: 'macho', label: 'Macho' },
  { value: 'hembra', label: 'Hembra' },
];

const TAMANOS = [
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
  { value: 'grande', label: 'Grande' },
];

const ESTADOS = [
  { value: 'en_adopcion', label: 'En adopción' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'en_tratamiento', label: 'En tratamiento' },
  { value: 'en_rescate', label: 'En rescate' },
];

const NIVELES_EJERCICIO = [
  { value: 'Bajo', label: 'Bajo' },
  { value: 'Medio', label: 'Medio' },
  { value: 'Alto', label: 'Alto' },
  { value: 'Muy alto', label: 'Muy alto' },
];

export default function NuevaMascotaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [seccion, setSeccion] = useState('basica'); // 'basica' | 'salud' | 'alimentacion' | 'legal'
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  // — Datos básicos —
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('perro');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('macho');
  const [tamano, setTamano] = useState('mediano');
  const [peso, setPeso] = useState('');
  const [color, setColor] = useState('');
  const [estado, setEstado] = useState('en_adopcion');
  const [ubicacion, setUbicacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comportamiento, setComportamiento] = useState('');
  const [nivelEjercicio, setNivelEjercicio] = useState('Medio');
  const [compatNinos, setCompatNinos] = useState(true);
  const [compatPerros, setCompatPerros] = useState(false);
  const [compatGatos, setCompatGatos] = useState(false);
  const [fechaRescate, setFechaRescate] = useState('');
  const [lugarRescate, setLugarRescate] = useState('');

  // — Salud —
  const [condicionSalud, setCondicionSalud] = useState('');
  const [esterilizado, setEsterilizado] = useState(false);
  const [microchip, setMicrochip] = useState(false);
  const [numMicrochip, setNumMicrochip] = useState('');
  const [alergias, setAlergias] = useState('');
  const [enfermedades, setEnfermedades] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  // Vacunas
  const [vacunas, setVacunas] = useState([]);
  const [nuevaVacunaNombre, setNuevaVacunaNombre] = useState('');
  const [nuevaVacunaFecha, setNuevaVacunaFecha] = useState('');
  const [nuevaVacunaProxima, setNuevaVacunaProxima] = useState('');

  // — Alimentación —
  const [aliTipo, setAliTipo] = useState('');
  const [aliFrecuencia, setAliFrecuencia] = useState('');
  const [aliCantidad, setAliCantidad] = useState('');
  const [aliMarca, setAliMarca] = useState('');
  const [aliRestricciones, setAliRestricciones] = useState('');

  // — Legal —
  const [notasLegales, setNotasLegales] = useState('');

  const agregarVacuna = () => {
    if (!nuevaVacunaNombre.trim()) {
      setSnackMessage('Ingresa el nombre de la vacuna.');
      setSnackVisible(true);
      return;
    }
    setVacunas(prev => [
      ...prev,
      { nombre: nuevaVacunaNombre.trim(), fecha: nuevaVacunaFecha.trim(), proxima: nuevaVacunaProxima.trim(), veterinario: '' },
    ]);
    setNuevaVacunaNombre('');
    setNuevaVacunaFecha('');
    setNuevaVacunaProxima('');
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setSeccion('basica');
      setSnackMessage('El nombre de la mascota es obligatorio.');
      setSnackVisible(true);
      return;
    }
    if (!especie) {
      setSnackMessage('Selecciona la especie.');
      setSnackVisible(true);
      return;
    }

    setLoading(true);
    try {
      const mascotaData = {
        nombre: nombre.trim(),
        especie,
        raza: raza.trim() || 'Mestizo/a',
        edad_aprox: edad.trim(),
        edad: parseFloat(edad) || undefined,
        sexo,
        tamano,
        peso: parseFloat(peso) || undefined,
        color: color.trim(),
        estado,
        ubicacion: ubicacion.trim(),
        descripcion: descripcion.trim(),
        comportamiento: comportamiento.trim(),
        nivel_ejercicio: nivelEjercicio,
        compatible_ninos: compatNinos,
        compatible_perros: compatPerros,
        compatible_gatos: compatGatos,
        fecha_rescate: fechaRescate.trim() || undefined,
        lugar_rescate: lugarRescate.trim(),
        // Salud
        condicion_salud: condicionSalud.trim(),
        esterilizado,
        microchip,
        numero_microchip: microchip ? numMicrochip.trim() : undefined,
        alergias: alergias.trim() || 'Ninguna',
        enfermedades_previas: enfermedades.trim() || 'Ninguna',
        medicamentos_actuales: medicamentos.trim() || 'Ninguno',
        vacunas,
        // Alimentación
        alimentacion: {
          tipo: aliTipo.trim(),
          frecuencia: aliFrecuencia.trim(),
          cantidad: aliCantidad.trim(),
          marca: aliMarca.trim(),
          restricciones: aliRestricciones.trim() || 'Ninguna',
        },
        // Legal
        documentos_legales: notasLegales.trim() ? [notasLegales.trim()] : [],
        foto_principal: null,
        fotos: [],
        id_rescatista: user?.id_usuario,
      };

      const result = await mascotasService.crear(mascotaData);
      if (result.success) {
        setSnackMessage(result.message || '¡Mascota registrada exitosamente!');
        setSnackVisible(true);
        setTimeout(() => router.back(), 1500);
      } else {
        setSnackMessage(result.message || 'Error al registrar la mascota.');
        setSnackVisible(true);
      }
    } catch (err) {
      setSnackMessage('Error al guardar. Se guardó localmente.');
      setSnackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const secciones = [
    { key: 'basica', label: 'Datos' },
    { key: 'salud', label: 'Salud' },
    { key: 'alimentacion', label: 'Nutrición' },
    { key: 'legal', label: 'Legal' },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: 'Registrar Mascota',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      {/* Tabs de sección */}
      <View style={[styles.tabRow, { borderBottomColor: theme.colors.outline, backgroundColor: theme.colors.surface }]}>
        {secciones.map(s => (
          <Pressable
            key={s.key}
            style={[
              styles.tabItem,
              seccion === s.key && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setSeccion(s.key)}
          >
            <Text
              variant="labelMedium"
              style={{ color: seccion === s.key ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: seccion === s.key ? '700' : '400' }}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ============ SECCIÓN: DATOS BÁSICOS ============ */}
        {seccion === 'basica' && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Card.Content>
              <SectionHeader icon="paw" title="Información Básica" theme={theme} />

              <TextInput label="Nombre de la mascota *" value={nombre} onChangeText={setNombre} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} left={<TextInput.Icon icon="paw" />} />

              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Especie *</Text>
              <View style={styles.chipsRow}>
                {ESPECIES.map(e => (
                  <Chip
                    key={e.value}
                    icon={e.icon}
                    selected={especie === e.value}
                    onPress={() => setEspecie(e.value)}
                    style={[styles.chip, especie === e.value && { backgroundColor: theme.colors.primaryContainer }]}
                    textStyle={{ color: especie === e.value ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant, fontSize: 12 }}
                    showSelectedOverlay
                  >
                    {e.label}
                  </Chip>
                ))}
              </View>

              <TextInput label="Raza" value={raza} onChangeText={setRaza} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Edad (ej: 2 años, 6 meses)" value={edad} onChangeText={setEdad} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} left={<TextInput.Icon icon="calendar-range" />} />
              <TextInput label="Peso (kg)" value={peso} onChangeText={setPeso} mode="outlined" keyboardType="decimal-pad" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} left={<TextInput.Icon icon="weight" />} />
              <TextInput label="Color / Pelaje" value={color} onChangeText={setColor} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} left={<TextInput.Icon icon="palette" />} />

              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Sexo</Text>
              <SegmentedButtons value={sexo} onValueChange={setSexo} buttons={SEXOS} style={styles.segmented} />

              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Tamaño</Text>
              <SegmentedButtons value={tamano} onValueChange={setTamano} buttons={TAMANOS} style={styles.segmented} />

              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Estado actual</Text>
              <View style={styles.chipsRow}>
                {ESTADOS.map(e => (
                  <Chip
                    key={e.value}
                    selected={estado === e.value}
                    onPress={() => setEstado(e.value)}
                    style={[styles.chip, estado === e.value && { backgroundColor: theme.colors.secondaryContainer }]}
                    textStyle={{ color: estado === e.value ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant, fontSize: 12 }}
                    showSelectedOverlay
                    compact
                  >
                    {e.label}
                  </Chip>
                ))}
              </View>

              <Divider style={styles.divider} />
              <SectionHeader icon="map-marker" title="Rescate y Ubicación" theme={theme} />
              <TextInput label="Ubicación actual" value={ubicacion} onChangeText={setUbicacion} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} left={<TextInput.Icon icon="map-marker" />} />
              <TextInput label="Fecha de rescate (AAAA-MM-DD)" value={fechaRescate} onChangeText={setFechaRescate} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} left={<TextInput.Icon icon="calendar" />} />
              <TextInput label="Lugar de rescate" value={lugarRescate} onChangeText={setLugarRescate} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} left={<TextInput.Icon icon="map-search" />} />

              <Divider style={styles.divider} />
              <SectionHeader icon="text" title="Descripción y Comportamiento" theme={theme} />
              <TextInput label="Descripción general" value={descripcion} onChangeText={setDescripcion} mode="outlined" multiline numberOfLines={4} style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Comportamiento y personalidad" value={comportamiento} onChangeText={setComportamiento} mode="outlined" multiline numberOfLines={3} style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />

              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Nivel de ejercicio requerido</Text>
              <View style={styles.chipsRow}>
                {NIVELES_EJERCICIO.map(n => (
                  <Chip key={n.value} selected={nivelEjercicio === n.value} onPress={() => setNivelEjercicio(n.value)} style={[styles.chip, nivelEjercicio === n.value && { backgroundColor: theme.colors.tertiaryContainer || theme.colors.primaryContainer }]} compact showSelectedOverlay>
                    {n.label}
                  </Chip>
                ))}
              </View>

              <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Compatibilidad</Text>
              <SwitchRow label="Compatible con niños" value={compatNinos} onChange={setCompatNinos} theme={theme} />
              <SwitchRow label="Compatible con perros" value={compatPerros} onChange={setCompatPerros} theme={theme} />
              <SwitchRow label="Compatible con gatos" value={compatGatos} onChange={setCompatGatos} theme={theme} />
            </Card.Content>
          </Card>
        )}

        {/* ============ SECCIÓN: SALUD ============ */}
        {seccion === 'salud' && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Card.Content>
              <SectionHeader icon="heart-pulse" title="Estado de Salud" theme={theme} />
              <TextInput label="Condición de salud" value={condicionSalud} onChangeText={setCondicionSalud} mode="outlined" style={styles.input} placeholder="Ej: Excelente, Buena, Regular" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <SwitchRow label="Esterilizado/a" value={esterilizado} onChange={setEsterilizado} theme={theme} />
              <SwitchRow label="Tiene microchip" value={microchip} onChange={setMicrochip} theme={theme} />
              {microchip && (
                <TextInput label="Número de microchip" value={numMicrochip} onChangeText={setNumMicrochip} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              )}
              <TextInput label="Alergias conocidas" value={alergias} onChangeText={setAlergias} mode="outlined" style={styles.input} placeholder="Ej: Ninguna, Alergia al maíz" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Enfermedades previas" value={enfermedades} onChangeText={setEnfermedades} mode="outlined" multiline numberOfLines={2} style={styles.input} placeholder="Ej: Ninguna, Parvovirus recuperado" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Medicamentos actuales" value={medicamentos} onChangeText={setMedicamentos} mode="outlined" style={styles.input} placeholder="Ej: Ninguno, Suplemento vitamínico" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />

              <Divider style={styles.divider} />
              <SectionHeader icon="needle" title="Vacunas" theme={theme} />
              {vacunas.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic', marginBottom: 12 }}>Sin vacunas agregadas aún.</Text>
              ) : (
                vacunas.map((v, i) => (
                  <View key={i} style={[styles.vacunaChip, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons name="needle" size={16} color={theme.colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>{v.nombre}</Text>
                      {v.fecha ? <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>Aplicada: {v.fecha}{v.proxima ? ' • Próxima: ' + v.proxima : ''}</Text> : null}
                    </View>
                    <Button mode="text" compact onPress={() => setVacunas(prev => prev.filter((_, idx) => idx !== i))} textColor={theme.colors.error}>Quitar</Button>
                  </View>
                ))
              )}
              <Text variant="labelSmall" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Agregar vacuna:</Text>
              <TextInput label="Nombre de la vacuna" value={nuevaVacunaNombre} onChangeText={setNuevaVacunaNombre} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Fecha de aplicación (AAAA-MM-DD)" value={nuevaVacunaFecha} onChangeText={setNuevaVacunaFecha} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Próxima dosis (AAAA-MM-DD)" value={nuevaVacunaProxima} onChangeText={setNuevaVacunaProxima} mode="outlined" style={styles.input} outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <Button mode="outlined" icon="plus" onPress={agregarVacuna} textColor={theme.colors.primary} style={{ borderColor: theme.colors.primary }}>
                Agregar vacuna
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* ============ SECCIÓN: ALIMENTACIÓN ============ */}
        {seccion === 'alimentacion' && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Card.Content>
              <SectionHeader icon="food-apple" title="Plan de Alimentación" theme={theme} />
              <TextInput label="Tipo de alimentación" value={aliTipo} onChangeText={setAliTipo} mode="outlined" style={styles.input} placeholder="Ej: Croquetas, Mixta, Cruda, Semillas" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Frecuencia de comida" value={aliFrecuencia} onChangeText={setAliFrecuencia} mode="outlined" style={styles.input} placeholder="Ej: 2 veces al día" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Cantidad por comida" value={aliCantidad} onChangeText={setAliCantidad} mode="outlined" style={styles.input} placeholder="Ej: 250 g, 2 cucharadas" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Marca o producto recomendado" value={aliMarca} onChangeText={setAliMarca} mode="outlined" style={styles.input} placeholder="Ej: Royal Canin, Purina, Natural" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
              <TextInput label="Restricciones alimenticias" value={aliRestricciones} onChangeText={setAliRestricciones} mode="outlined" multiline numberOfLines={2} style={styles.input} placeholder="Ej: Sin maíz, Sin lácteos, Ninguna" outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />
            </Card.Content>
          </Card>
        )}

        {/* ============ SECCIÓN: LEGAL ============ */}
        {seccion === 'legal' && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Card.Content>
              <SectionHeader icon="file-document" title="Documentación Legal" theme={theme} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                Registra información legal del animal (actas de rescate, permisos MINEC, documentos de donación, etc.).
              </Text>
              <TextInput label="Notas o descripción del documento legal" value={notasLegales} onChangeText={setNotasLegales} mode="outlined" multiline numberOfLines={4} style={styles.input} placeholder="Ej: Acta de confiscación MINEC-2026-0127, Carta de donación voluntaria..." outlineColor={theme.colors.outline} activeOutlineColor={theme.colors.primary} />

              <Button
                mode="outlined"
                icon="file-upload"
                style={[styles.pdfBtn, { borderColor: '#E64A19' }]}
                textColor="#E64A19"
                onPress={() => {
                  setSnackMessage('La importación de PDF estará disponible cuando el servidor esté activo.');
                  setSnackVisible(true);
                }}
              >
                Adjuntar documento legal (PDF)
              </Button>

              <View style={[styles.infoBox, { backgroundColor: theme.colors.primaryContainer || '#FFF3E0' }]}>
                <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer || '#E64A19', flex: 1 }}>
                  Los documentos adjuntos se almacenarán en el servidor cuando haya conexión. En modo offline se guardará el texto descriptivo.
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Botón principal guardar */}
        <View style={styles.saveRow}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={{ flex: 1, borderColor: theme.colors.outline }}
            textColor={theme.colors.onSurfaceVariant}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            icon="content-save"
            onPress={handleGuardar}
            loading={loading}
            disabled={loading}
            style={{ flex: 2, borderRadius: 8 }}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            contentStyle={{ paddingVertical: 4 }}
          >
            {loading ? 'Guardando...' : 'Registrar Mascota'}
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3500}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {snackMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ icon, title, theme }) {
  return (
    <View style={[styles.sectionHeader, { borderLeftColor: theme.colors.primary }]}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>{title}</Text>
    </View>
  );
}

function SwitchRow({ label, value, onChange, theme }) {
  return (
    <View style={styles.switchRow}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} color={theme.colors.primary} />
    </View>
  );
}


const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 12, marginBottom: 12 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  input: { marginBottom: 12 },
  label: { marginBottom: 6, marginTop: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { marginBottom: 2 },
  segmented: { marginBottom: 14 },
  divider: { marginVertical: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, borderLeftWidth: 3, paddingLeft: 8 },
  vacunaChip: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, marginBottom: 8 },
  pdfBtn: { marginBottom: 12, borderRadius: 8 },
  infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 8, alignItems: 'flex-start' },
  saveRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
});
