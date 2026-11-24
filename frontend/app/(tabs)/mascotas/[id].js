import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
  FlatList,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  Divider,
  useTheme,
  Dialog,
  Portal,
  TextInput,
  Snackbar,
  List,
  Badge,
} from 'react-native-paper';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import mascotasService from '../../../src/services/mascotas.service';
import solicitudesService from '../../../src/services/solicitudes.service';
import { useAuth } from '../../../src/hooks/useAuth';
import LoadingScreen from '../../../src/components/LoadingScreen';
import ErrorMessage from '../../../src/components/ErrorMessage';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400.png?text=Sin+Foto';

const estadoColors = {
  en_adopcion: '#4CAF50',
  disponible: '#4CAF50',
  en_proceso: '#FF9800',
  adoptada: '#2196F3',
  adoptado: '#2196F3',
  en_rescate: '#9C27B0',
  en_tratamiento: '#F44336',
};

const estadoLabels = {
  en_adopcion: 'En adopción',
  disponible: 'Disponible',
  en_proceso: 'En proceso',
  adoptada: 'Adoptada',
  adoptado: 'Adoptada',
  en_rescate: 'En rescate',
  en_tratamiento: 'En tratamiento',
};

function generarHTMLPDF(mascota) {
  const vacunaRows = (mascota.vacunas || []).map(v =>
    `<tr><td>${v.nombre}</td><td>${v.fecha || '-'}</td><td>${v.proxima || '-'}</td><td>${v.veterinario || '-'}</td></tr>`
  ).join('') || '<tr><td colspan="4" style="text-align:center;color:#888">Sin vacunas registradas</td></tr>';

  const docRows = (mascota.documentos_legales || []).map(d =>
    `<li style="margin-bottom:4px;">📄 ${d}</li>`
  ).join('') || '<li style="color:#888">Sin documentos adjuntos</li>';

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Expediente de ${mascota.nombre}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #333; font-size: 13px; }
      h1 { color: #E64A19; border-bottom: 3px solid #E64A19; padding-bottom: 8px; }
      h2 { color: #BF360C; margin-top: 20px; border-left: 4px solid #FF7043; padding-left: 8px; }
      .header { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; }
      .header img { width: 180px; height: 140px; object-fit: cover; border-radius: 12px; border: 2px solid #FF7043; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
      .info-item { background: #FFF3E0; border-radius: 6px; padding: 8px 12px; }
      .info-label { font-size: 11px; color: #E64A19; font-weight: bold; text-transform: uppercase; }
      .info-value { font-size: 13px; color: #333; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th { background: #E64A19; color: white; padding: 8px 10px; text-align: left; font-size: 12px; }
      td { border-bottom: 1px solid #eee; padding: 7px 10px; font-size: 12px; }
      tr:nth-child(even) td { background: #FFF8F0; }
      .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; color: white; }
      .badge-verde { background: #4CAF50; }
      .badge-naranja { background: #FF9800; }
      .badge-azul { background: #2196F3; }
      .badge-rojo { background: #F44336; }
      .section-box { background: #FFF3E0; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
      .compat-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
      .compat-chip { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
      .chip-si { background: #E8F5E9; color: #2E7D32; border: 1px solid #A5D6A7; }
      .chip-no { background: #FFEBEE; color: #C62828; border: 1px solid #EF9A9A; }
      footer { margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px; color: #888; font-size: 11px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="${mascota.foto_principal || PLACEHOLDER_IMAGE}" alt="${mascota.nombre}"/>
      <div>
        <h1>🐾 ${mascota.nombre}</h1>
        <p><strong>Raza:</strong> ${mascota.raza || 'No especificada'}</p>
        <p><strong>Especie:</strong> ${(mascota.especie || '').charAt(0).toUpperCase() + (mascota.especie || '').slice(1)}</p>
        <p>
          <span class="badge ${mascota.estado === 'adoptado' || mascota.estado === 'adoptada' ? 'badge-azul' : mascota.estado === 'en_proceso' ? 'badge-naranja' : mascota.estado === 'en_tratamiento' ? 'badge-rojo' : 'badge-verde'}">
            ${estadoLabels[mascota.estado] || mascota.estado || 'En adopción'}
          </span>
        </p>
      </div>
    </div>

    <h2>📋 Información General</h2>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Edad</div><div class="info-value">${mascota.edad_aprox || (mascota.edad ? mascota.edad + ' años' : 'No especificada')}</div></div>
      <div class="info-item"><div class="info-label">Sexo</div><div class="info-value">${mascota.sexo || 'No especificado'}</div></div>
      <div class="info-item"><div class="info-label">Tamaño</div><div class="info-value">${mascota.tamano || 'No especificado'}</div></div>
      <div class="info-item"><div class="info-label">Peso</div><div class="info-value">${mascota.peso ? mascota.peso + ' kg' : 'No especificado'}</div></div>
      <div class="info-item"><div class="info-label">Color</div><div class="info-value">${mascota.color || 'No especificado'}</div></div>
      <div class="info-item"><div class="info-label">Ubicación</div><div class="info-value">${mascota.ubicacion || 'No especificada'}</div></div>
      <div class="info-item"><div class="info-label">Fecha de Rescate</div><div class="info-value">${mascota.fecha_rescate || 'No especificada'}</div></div>
      <div class="info-item"><div class="info-label">Lugar de Rescate</div><div class="info-value">${mascota.lugar_rescate || 'No especificado'}</div></div>
    </div>

    ${mascota.descripcion ? `<div class="section-box"><strong>Descripción:</strong><br/>${mascota.descripcion}</div>` : ''}

    <h2>🏥 Salud y Vacunas</h2>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Condición de Salud</div><div class="info-value">${mascota.condicion_salud || 'No especificada'}</div></div>
      <div class="info-item"><div class="info-label">Esterilizado/a</div><div class="info-value">${mascota.esterilizado ? '✅ Sí' : '❌ No'}</div></div>
      <div class="info-item"><div class="info-label">Microchip</div><div class="info-value">${mascota.microchip ? '✅ Sí — ' + (mascota.numero_microchip || '') : '❌ No'}</div></div>
      <div class="info-item"><div class="info-label">Alergias</div><div class="info-value">${mascota.alergias || 'Ninguna'}</div></div>
      <div class="info-item"><div class="info-label">Enfermedades Previas</div><div class="info-value">${mascota.enfermedades_previas || 'Ninguna'}</div></div>
      <div class="info-item"><div class="info-label">Medicamentos Actuales</div><div class="info-value">${mascota.medicamentos_actuales || 'Ninguno'}</div></div>
    </div>

    <strong>Historial de Vacunación:</strong>
    <table>
      <thead><tr><th>Vacuna</th><th>Fecha Aplicación</th><th>Próxima Dosis</th><th>Veterinario</th></tr></thead>
      <tbody>${vacunaRows}</tbody>
    </table>

    <h2>🍽️ Alimentación</h2>
    ${mascota.alimentacion ? `
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Tipo de Alimentación</div><div class="info-value">${mascota.alimentacion.tipo || '-'}</div></div>
      <div class="info-item"><div class="info-label">Frecuencia</div><div class="info-value">${mascota.alimentacion.frecuencia || '-'}</div></div>
      <div class="info-item"><div class="info-label">Cantidad</div><div class="info-value">${mascota.alimentacion.cantidad || '-'}</div></div>
      <div class="info-item"><div class="info-label">Marca/Producto</div><div class="info-value">${mascota.alimentacion.marca || '-'}</div></div>
      <div class="info-item" style="grid-column: span 2;"><div class="info-label">Restricciones Alimenticias</div><div class="info-value">${mascota.alimentacion.restricciones || 'Ninguna'}</div></div>
    </div>` : '<p style="color:#888">Sin información de alimentación</p>'}

    <h2>🧠 Comportamiento y Compatibilidad</h2>
    <div class="section-box">
      <p><strong>Comportamiento:</strong> ${mascota.comportamiento || 'No especificado'}</p>
      <p><strong>Nivel de Ejercicio:</strong> ${mascota.nivel_ejercicio || 'No especificado'}</p>
      <div class="compat-row">
        <span class="compat-chip ${mascota.compatible_ninos ? 'chip-si' : 'chip-no'}">${mascota.compatible_ninos ? '✅' : '❌'} Niños</span>
        <span class="compat-chip ${mascota.compatible_perros ? 'chip-si' : 'chip-no'}">${mascota.compatible_perros ? '✅' : '❌'} Perros</span>
        <span class="compat-chip ${mascota.compatible_gatos ? 'chip-si' : 'chip-no'}">${mascota.compatible_gatos ? '✅' : '❌'} Gatos</span>
      </div>
    </div>

    <h2>📄 Documentos Legales</h2>
    <div class="section-box">
      <ul style="margin:0; padding-left: 20px;">
        ${docRows}
      </ul>
    </div>

    <footer>
      Plataforma Colaborativa de Adopción de Mascotas • Estado Zulia, Venezuela<br/>
      Documento generado el ${new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
    </footer>
  </body>
  </html>`;
}

export default function MascotaDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const rol = user?.rol?.toLowerCase() || '';

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'salud' | 'alimentacion' | 'legal'

  const [adoptDialog, setAdoptDialog] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [experienciaAdop, setExperienciaAdop] = useState('');
  const [adoptLoading, setAdoptLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width > 768;

  useEffect(() => {
    fetchMascota();
  }, [id]);

  const fetchMascota = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await mascotasService.obtener(id);
      if (result.success) {
        setMascota(result.data);
      } else {
        setError(result.message || 'Error al cargar mascota.');
      }
    } catch (err) {
      setError('Error al cargar la mascota.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = async () => {
    if (!motivo.trim()) {
      setSnackMessage('Por favor indica el motivo de adopción.');
      setSnackVisible(true);
      return;
    }
    setAdoptLoading(true);
    try {
      const result = await solicitudesService.crear({
        mascotaId: id,
        motivo: motivo.trim(),
        experiencia: experienciaAdop.trim(),
      });
      if (result.success) {
        setAdoptDialog(false);
        setMotivo('');
        setExperienciaAdop('');
        setSnackMessage('¡Solicitud de adopción enviada exitosamente!');
        setSnackVisible(true);
        fetchMascota();
      } else {
        setSnackMessage(result.message || 'Error al enviar solicitud.');
        setSnackVisible(true);
      }
    } catch (err) {
      setSnackMessage(err.response?.data?.message || 'Error al enviar la solicitud.');
      setSnackVisible(true);
    } finally {
      setAdoptLoading(false);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        setSnackMessage('Se necesitan permisos para acceder a la galería.');
        setSnackVisible(true);
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
        setUploadingPhoto(true);
        const asset = pickerResult.assets[0];
        const formData = new FormData();
        const filename = asset.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('foto', { uri: asset.uri, name: filename, type });
        const result = await mascotasService.subirFotos(id, formData);
        if (result.success) {
          setSnackMessage('Foto subida exitosamente.');
          setSnackVisible(true);
          fetchMascota();
        }
      }
    } catch (err) {
      setSnackMessage('Error al subir la foto.');
      setSnackVisible(true);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleExportarPDF = async () => {
    if (!mascota) return;
    setExportingPDF(true);
    try {
      const html = generarHTMLPDF(mascota);
      if (Platform.OS === 'web') {
        // En web: abrir ventana de impresión
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
      } else {
        // En móvil: usar Share API con contenido HTML
        await Share.share({
          message: `Expediente de ${mascota.nombre}\n\nEspecie: ${mascota.especie}\nEdad: ${mascota.edad_aprox || mascota.edad + ' años'}\nEstado: ${estadoLabels[mascota.estado] || mascota.estado}\n\nDescripción: ${mascota.descripcion || '-'}\n\nVacunas: ${(mascota.vacunas || []).map(v => v.nombre).join(', ') || 'Ninguna'}\nAlimentación: ${mascota.alimentacion?.tipo || '-'}\n\n— Plataforma de Adopción de Mascotas, Estado Zulia`,
          title: `Expediente - ${mascota.nombre}`,
        });
      }
      setSnackMessage('PDF exportado / compartido correctamente.');
      setSnackVisible(true);
    } catch (err) {
      setSnackMessage('Error al exportar el PDF.');
      setSnackVisible(true);
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cargando...', headerShown: true }} />
        <LoadingScreen message="Cargando mascota..." />
      </>
    );
  }

  if (error || !mascota) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error', headerShown: true }} />
        <ErrorMessage message={error || 'Mascota no encontrada.'} onRetry={fetchMascota} />
      </>
    );
  }

  const fotos =
    mascota.fotos && mascota.fotos.length > 0
      ? mascota.fotos.map((f) => f.url_imagen || f.url || f)
      : mascota.foto_principal ? [mascota.foto_principal] : [PLACEHOLDER_IMAGE];
  const estado = mascota.estado || 'en_adopcion';
  const canAdopt = rol === 'adoptante' && (estado === 'en_adopcion' || estado === 'disponible');
  const canUploadPhotos = rol === 'rescatista' || rol === 'veterinario' || rol === 'administrador';
  const canExport = true;

  const tabs = [
    { key: 'info', icon: 'information', label: 'Info' },
    { key: 'salud', icon: 'medical-bag', label: 'Salud' },
    { key: 'alimentacion', icon: 'food-apple', label: 'Nutrición' },
    { key: 'legal', icon: 'file-document', label: 'Legal' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: mascota.nombre || 'Mascota',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
          headerRight: () => (
            <Button
              icon="file-pdf-box"
              mode="text"
              compact
              onPress={handleExportarPDF}
              loading={exportingPDF}
              textColor={theme.colors.primary}
            >
              PDF
            </Button>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainContent, isWide && styles.mainContentWide]}>

          {/* Galería */}
          <View style={styles.photoSection}>
            <Image
              source={{ uri: fotos[selectedPhoto] || fotos[0] }}
              style={[styles.mainPhoto, isWide && styles.mainPhotoWide]}
              resizeMode="cover"
            />
            {fotos.length > 1 && (
              <FlatList
                horizontal
                data={fotos}
                keyExtractor={(_, i) => `thumb-${i}`}
                renderItem={({ item, index }) => (
                  <Pressable onPress={() => setSelectedPhoto(index)}>
                    <Image
                      source={{ uri: item }}
                      style={[
                        styles.thumbnail,
                        selectedPhoto === index && { borderColor: theme.colors.primary, borderWidth: 3 },
                      ]}
                    />
                  </Pressable>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              />
            )}
            <View style={styles.photoActions}>
              {canUploadPhotos && (
                <Button
                  mode="outlined"
                  icon="camera-plus"
                  onPress={handlePickPhoto}
                  loading={uploadingPhoto}
                  disabled={uploadingPhoto}
                  style={{ flex: 1, borderColor: theme.colors.primary }}
                  textColor={theme.colors.primary}
                  compact
                >
                  {uploadingPhoto ? 'Subiendo...' : 'Agregar foto'}
                </Button>
              )}
              <Button
                mode="outlined"
                icon="file-pdf-box"
                onPress={handleExportarPDF}
                loading={exportingPDF}
                disabled={exportingPDF}
                style={{ flex: 1, borderColor: '#E64A19' }}
                textColor="#E64A19"
                compact
              >
                Exportar PDF
              </Button>
            </View>
          </View>

          {/* Nombre y estado */}
          <View style={styles.nameRow}>
            <Text variant="headlineSmall" style={[styles.petName, { color: theme.colors.onBackground }]}>
              {mascota.nombre}
            </Text>
            <Chip
              style={{ backgroundColor: estadoColors[estado] || '#9E9E9E' }}
              textStyle={{ color: '#FFF', fontWeight: '600' }}
            >
              {estadoLabels[estado] || estado}
            </Chip>
          </View>

          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}
          >
            {mascota.raza || 'Raza no especificada'} • {mascota.edad_aprox || (mascota.edad ? mascota.edad + ' años' : '')} • {mascota.sexo || ''} • {mascota.tamano || ''}
          </Text>

          {/* Tabs */}
          <View style={[styles.tabRow, { borderBottomColor: theme.colors.outline }]}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                style={[
                  styles.tabItem,
                  activeTab === tab.key && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={18}
                  color={activeTab === tab.key ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="labelMedium"
                  style={{ color: activeTab === tab.key ? theme.colors.primary : theme.colors.onSurfaceVariant, marginTop: 2 }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab: Info General */}
          {activeTab === 'info' && (
            <Card style={[styles.tabCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <Card.Content>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Información General
                </Text>
                <View style={styles.detailsGrid}>
                  <DetailItem icon="paw" label="Especie" value={mascota.especie || '-'} theme={theme} />
                  <DetailItem icon="tag" label="Raza" value={mascota.raza || '-'} theme={theme} />
                  <DetailItem icon="calendar-range" label="Edad" value={mascota.edad_aprox || (mascota.edad ? mascota.edad + ' años' : '-')} theme={theme} />
                  <DetailItem icon="gender-male-female" label="Sexo" value={mascota.sexo || '-'} theme={theme} />
                  <DetailItem icon="weight" label="Peso" value={mascota.peso ? mascota.peso + ' kg' : '-'} theme={theme} />
                  <DetailItem icon="palette" label="Color" value={mascota.color || '-'} theme={theme} />
                  <DetailItem icon="map-marker" label="Ubicación" value={mascota.ubicacion || '-'} theme={theme} />
                  <DetailItem icon="calendar" label="Fecha Rescate" value={mascota.fecha_rescate || '-'} theme={theme} />
                  <DetailItem icon="map-search" label="Lugar Rescate" value={mascota.lugar_rescate || '-'} theme={theme} />
                  <DetailItem icon="run" label="Nivel Ejercicio" value={mascota.nivel_ejercicio || '-'} theme={theme} />
                </View>

                {mascota.descripcion && (
                  <>
                    <Divider style={styles.divider} />
                    <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Descripción</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>
                      {mascota.descripcion}
                    </Text>
                  </>
                )}

                <Divider style={styles.divider} />
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Comportamiento</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                  {mascota.comportamiento || 'No especificado'}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 6 }}>Compatibilidad:</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <Chip
                    icon={mascota.compatible_ninos ? 'check-circle' : 'close-circle'}
                    style={{ backgroundColor: mascota.compatible_ninos ? '#E8F5E9' : '#FFEBEE' }}
                    textStyle={{ color: mascota.compatible_ninos ? '#2E7D32' : '#C62828', fontSize: 11 }}
                    compact
                  >
                    Niños
                  </Chip>
                  <Chip
                    icon={mascota.compatible_perros ? 'check-circle' : 'close-circle'}
                    style={{ backgroundColor: mascota.compatible_perros ? '#E8F5E9' : '#FFEBEE' }}
                    textStyle={{ color: mascota.compatible_perros ? '#2E7D32' : '#C62828', fontSize: 11 }}
                    compact
                  >
                    Perros
                  </Chip>
                  <Chip
                    icon={mascota.compatible_gatos ? 'check-circle' : 'close-circle'}
                    style={{ backgroundColor: mascota.compatible_gatos ? '#E8F5E9' : '#FFEBEE' }}
                    textStyle={{ color: mascota.compatible_gatos ? '#2E7D32' : '#C62828', fontSize: 11 }}
                    compact
                  >
                    Gatos
                  </Chip>
                </View>

                <Divider style={styles.divider} />
                <View style={styles.actions}>
                  {canAdopt && (
                    <Button
                      mode="contained"
                      icon="heart"
                      onPress={() =>
                        router.push(
                          `/(tabs)/solicitudes/nueva?mascotaId=${mascota.id_mascota || mascota.id}&mascotaNombre=${encodeURIComponent(mascota.nombre)}`
                        )
                      }
                      buttonColor={theme.colors.primary}
                      textColor={theme.colors.onPrimary}
                      style={styles.actionButton}
                      contentStyle={styles.actionButtonContent}
                    >
                      Solicitar Adopción
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Tab: Salud */}
          {activeTab === 'salud' && (
            <Card style={[styles.tabCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <Card.Content>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Estado de Salud
                </Text>
                <View style={styles.detailsGrid}>
                  <DetailItem icon="heart-pulse" label="Condición" value={mascota.condicion_salud || '-'} theme={theme} />
                  <DetailItem icon="medical-bag" label="Esterilizado/a" value={mascota.esterilizado ? '✅ Sí' : '❌ No'} theme={theme} />
                  <DetailItem icon="chip" label="Microchip" value={mascota.microchip ? '✅ Sí' : '❌ No'} theme={theme} />
                  {mascota.numero_microchip && (
                    <DetailItem icon="barcode" label="N° Microchip" value={mascota.numero_microchip} theme={theme} />
                  )}
                  <DetailItem icon="allergy" label="Alergias" value={mascota.alergias || 'Ninguna'} theme={theme} />
                  <DetailItem icon="history" label="Enf. Previas" value={mascota.enfermedades_previas || 'Ninguna'} theme={theme} />
                  <DetailItem icon="pill" label="Medicamentos" value={mascota.medicamentos_actuales || 'Ninguno'} theme={theme} />
                </View>

                <Divider style={styles.divider} />
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Historial de Vacunación
                </Text>
                {(mascota.vacunas || []).length === 0 ? (
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
                    Sin vacunas registradas
                  </Text>
                ) : (
                  mascota.vacunas.map((v, i) => (
                    <View key={i} style={[styles.vacunaRow, { backgroundColor: theme.colors.surfaceVariant || '#FFF3E0' }]}>
                      <MaterialCommunityIcons name="needle" size={18} color={theme.colors.primary} style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                          {v.nombre}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          Aplicada: {v.fecha || '-'} • Próxima: {v.proxima || '-'}
                        </Text>
                        {v.veterinario && (
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            Veterinario: {v.veterinario}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </Card.Content>
            </Card>
          )}

          {/* Tab: Alimentación */}
          {activeTab === 'alimentacion' && (
            <Card style={[styles.tabCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <Card.Content>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Plan de Alimentación
                </Text>
                {mascota.alimentacion ? (
                  <>
                    <View style={styles.detailsGrid}>
                      <DetailItem icon="food-apple" label="Tipo" value={mascota.alimentacion.tipo || '-'} theme={theme} />
                      <DetailItem icon="clock-outline" label="Frecuencia" value={mascota.alimentacion.frecuencia || '-'} theme={theme} />
                      <DetailItem icon="weight-gram" label="Cantidad" value={mascota.alimentacion.cantidad || '-'} theme={theme} />
                      <DetailItem icon="package-variant" label="Marca/Producto" value={mascota.alimentacion.marca || '-'} theme={theme} />
                    </View>
                    <Divider style={styles.divider} />
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>Restricciones Alimenticias:</Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {mascota.alimentacion.restricciones || 'Ninguna restricción'}
                    </Text>
                  </>
                ) : (
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
                    Sin información de alimentación registrada
                  </Text>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Tab: Legal */}
          {activeTab === 'legal' && (
            <Card style={[styles.tabCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <Card.Content>
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Documentos Legales
                </Text>
                {(mascota.documentos_legales || []).length === 0 ? (
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic', marginBottom: 12 }}>
                    Sin documentos adjuntos
                  </Text>
                ) : (
                  mascota.documentos_legales.map((doc, i) => (
                    <List.Item
                      key={i}
                      title={doc}
                      left={(props) => <List.Icon {...props} icon="file-pdf-box" color="#E64A19" />}
                      style={{ paddingLeft: 0 }}
                      titleStyle={{ color: theme.colors.onSurface }}
                    />
                  ))
                )}

                <Button
                  mode="outlined"
                  icon="file-upload"
                  style={{ marginTop: 8, borderColor: '#E64A19' }}
                  textColor="#E64A19"
                  onPress={() => {
                    setSnackMessage('Importación de PDF disponible en el servidor cuando haya conexión.');
                    setSnackVisible(true);
                  }}
                >
                  Importar Documento Legal (PDF)
                </Button>

                <Divider style={styles.divider} />
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Exportar Expediente Completo
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
                  Genera un PDF con toda la información del animal (datos, salud, vacunas, alimentación y documentos legales).
                </Text>
                <Button
                  mode="contained"
                  icon="file-pdf-box"
                  onPress={handleExportarPDF}
                  loading={exportingPDF}
                  disabled={exportingPDF}
                  buttonColor="#E64A19"
                  textColor="#FFF"
                >
                  {exportingPDF ? 'Generando PDF...' : 'Exportar PDF Completo'}
                </Button>
              </Card.Content>
            </Card>
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
  );
}

function DetailItem({ icon, label, value, theme }) {
  return (
    <View style={detailStyles.container}>
      <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
      <View style={detailStyles.textContainer}>
        <Text variant="labelSmall" style={{ color: theme.colors.primary, fontSize: 10 }}>{label}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '48%',
    marginBottom: 12,
  },
  textContainer: { flex: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  mainContent: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  mainContentWide: { maxWidth: 900 },
  photoSection: { marginBottom: 16 },
  mainPhoto: { width: '100%', height: 280, borderRadius: 16 },
  mainPhotoWide: { height: 380 },
  thumbnailList: { paddingTop: 8, gap: 8 },
  thumbnail: { width: 64, height: 64, borderRadius: 8, marginRight: 8 },
  photoActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  petName: { fontWeight: '700', flex: 1 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 12 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabCard: { borderRadius: 12, marginBottom: 16 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  sectionTitle: { fontWeight: '600', marginBottom: 10 },
  divider: { marginVertical: 14 },
  vacunaRow: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: 8, marginBottom: 8 },
  actions: { gap: 10 },
  actionButton: { borderRadius: 8 },
  actionButtonContent: { paddingVertical: 6 },
  dialogInput: { marginBottom: 12 },
});
