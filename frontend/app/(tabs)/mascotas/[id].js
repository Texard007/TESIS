import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Pressable,
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

  // Dialogo de adopción
  const [adoptDialog, setAdoptDialog] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [experienciaAdop, setExperienciaAdop] = useState('');
  const [adoptLoading, setAdoptLoading] = useState(false);

  // Subida de fotos
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Snackbar
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const { width } = Dimensions.get('window');
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
      setError('Error al cargar la mascota. Verifica tu conexión.');
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
      const solicitudData = {
        mascotaId: id,
        motivo: motivo.trim(),
        experiencia: experienciaAdop.trim(),
      };
      const result = await solicitudesService.crear(solicitudData);
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
      const msg = err.response?.data?.message || 'Error al enviar la solicitud.';
      setSnackMessage(msg);
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

        formData.append('foto', {
          uri: asset.uri,
          name: filename,
          type,
        });

        const result = await mascotasService.subirFotos(id, formData);
        if (result.success) {
          setSnackMessage('Foto subida exitosamente.');
          setSnackVisible(true);
          fetchMascota();
        } else {
          setSnackMessage(result.message || 'Error al subir la foto.');
          setSnackVisible(true);
        }
      }
    } catch (err) {
      setSnackMessage('Error al subir la foto.');
      setSnackVisible(true);
    } finally {
      setUploadingPhoto(false);
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
      : (mascota.foto_principal ? [mascota.foto_principal] : [PLACEHOLDER_IMAGE]);
  const estado = mascota.estado || 'en_adopcion';
  const canAdopt = rol === 'adoptante' && (estado === 'en_adopcion' || estado === 'disponible');
  const canUploadPhotos = rol === 'rescatista' || rol === 'veterinario' || rol === 'administrador';
  const canViewExpediente = rol === 'veterinario' || rol === 'rescatista' || rol === 'administrador';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: mascota.nombre || 'Mascota',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.primary,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainContent, isWide && styles.mainContentWide]}>
          {/* Galería de fotos */}
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
                        selectedPhoto === index && {
                          borderColor: theme.colors.primary,
                          borderWidth: 3,
                        },
                      ]}
                    />
                  </Pressable>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              />
            )}
            {canUploadPhotos && (
              <Button
                mode="outlined"
                icon="camera-plus"
                onPress={handlePickPhoto}
                loading={uploadingPhoto}
                disabled={uploadingPhoto}
                style={styles.uploadButton}
                textColor={theme.colors.primary}
              >
                {uploadingPhoto ? 'Subiendo...' : 'Agregar foto'}
              </Button>
            )}
          </View>

          {/* Info de la mascota */}
          <Card
            style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}
            elevation={1}
          >
            <Card.Content>
              <View style={styles.nameRow}>
                <Text
                  variant="headlineSmall"
                  style={[styles.petName, { color: theme.colors.onSurface }]}
                >
                  {mascota.nombre}
                </Text>
                <Chip
                  style={{ backgroundColor: estadoColors[estado] || '#9E9E9E' }}
                  textStyle={{ color: '#FFF', fontWeight: '600' }}
                >
                  {estadoLabels[estado] || estado}
                </Chip>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailsGrid}>
                <DetailItem
                  icon="paw"
                  label="Especie"
                  value={mascota.especie || 'No especificada'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
                <DetailItem
                  icon="tag"
                  label="Raza"
                  value={mascota.raza || 'No especificada'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
                <DetailItem
                  icon="calendar"
                  label="Edad"
                  value={
                    mascota.edad
                      ? `${mascota.edad} ${mascota.edad === 1 ? 'año' : 'años'}`
                      : 'No especificada'
                  }
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
                <DetailItem
                  icon="gender-male-female"
                  label="Sexo"
                  value={mascota.sexo || 'No especificado'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
                <DetailItem
                  icon="weight"
                  label="Peso"
                  value={mascota.peso ? `${mascota.peso} kg` : 'No especificado'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
                <DetailItem
                  icon="map-marker"
                  label="Ubicación"
                  value={mascota.ubicacion || 'No especificada'}
                  color={theme.colors.primary}
                  textColor={theme.colors.onSurface}
                />
              </View>

              {mascota.descripcion && (
                <>
                  <Divider style={styles.divider} />
                  <Text
                    variant="titleSmall"
                    style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
                  >
                    Descripción
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}
                  >
                    {mascota.descripcion}
                  </Text>
                </>
              )}

              <Divider style={styles.divider} />

              {/* Botones de acción */}
              <View style={styles.actions}>
                {canAdopt && (
                  <Button
                    mode="contained"
                    icon="heart"
                    onPress={() => setAdoptDialog(true)}
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.onPrimary}
                    style={styles.actionButton}
                    contentStyle={styles.actionButtonContent}
                  >
                    Solicitar Adopción
                  </Button>
                )}

                {canViewExpediente && (
                  <Button
                    mode="outlined"
                    icon="medical-bag"
                    onPress={() =>
                      router.push(`/(tabs)/expedientes/${mascota._id || mascota.id}`)
                    }
                    textColor={theme.colors.secondary}
                    style={styles.actionButton}
                  >
                    Ver Expediente Médico
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Dialog de adopción */}
      <Portal>
        <Dialog
          visible={adoptDialog}
          onDismiss={() => setAdoptDialog(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Solicitar Adopción
          </Dialog.Title>
          <Dialog.Content>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}
            >
              Cuéntanos por qué quieres adoptar a {mascota.nombre}:
            </Text>
            <TextInput
              label="Motivo de adopción *"
              value={motivo}
              onChangeText={setMotivo}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            <TextInput
              label="Experiencia con mascotas"
              value={experienciaAdop}
              onChangeText={setExperienciaAdop}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAdoptDialog(false)} textColor={theme.colors.onSurfaceVariant}>
              Cancelar
            </Button>
            <Button
              onPress={handleAdopt}
              loading={adoptLoading}
              disabled={adoptLoading}
              textColor={theme.colors.primary}
            >
              Enviar Solicitud
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

function DetailItem({ icon, label, value, color, textColor }) {
  return (
    <View style={detailStyles.container}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <View style={detailStyles.textContainer}>
        <Text variant="labelSmall" style={{ color: color }}>
          {label}
        </Text>
        <Text variant="bodyMedium" style={{ color: textColor }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
    marginBottom: 12,
  },
  textContainer: {
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
  mainContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  mainContentWide: {
    maxWidth: 900,
  },
  photoSection: {
    marginBottom: 16,
  },
  mainPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  mainPhotoWide: {
    height: 400,
  },
  thumbnailList: {
    paddingTop: 8,
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
  },
  uploadButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  infoCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  petName: {
    fontWeight: '700',
  },
  divider: {
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: 6,
  },
  dialogInput: {
    marginBottom: 12,
  },
});
