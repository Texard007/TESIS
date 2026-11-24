import React from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x200.png?text=Sin+Foto';

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

const especieIcons = {
  perro: 'dog',
  gato: 'cat',
  ave: 'bird',
  conejo: 'rabbit',
  otro: 'paw',
};

export default function PetCard({ mascota, onPress }) {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const isWide = width > 768;

  const foto =
    mascota.foto_principal ||
    (mascota.fotos && mascota.fotos.length > 0
      ? (mascota.fotos[0].url_imagen || mascota.fotos[0].url || mascota.fotos[0])
      : null) ||
    PLACEHOLDER_IMAGE;

  const estado = mascota.estado || 'en_adopcion';
  const especie = mascota.especie?.toLowerCase() || 'otro';
  const edadDisplay = mascota.edad_aprox || (mascota.edad ? `${mascota.edad} años` : 'Edad desconocida');

  return (
    <View style={[styles.cardWrapper, isWide ? styles.cardWrapperWide : styles.cardWrapperMobile]}>
      <Pressable onPress={() => onPress && onPress(mascota)} style={{ flex: 1 }}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Card.Cover
            source={{ uri: foto }}
            style={styles.cover}
            resizeMode="cover"
          />
          <Card.Content style={styles.content}>
            <View style={styles.headerRow}>
              <View style={styles.nameRow}>
                <MaterialCommunityIcons
                  name={especieIcons[especie] || 'paw'}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={[styles.name, { color: theme.colors.onSurface }]}>
                  {mascota.nombre}
                </Text>
              </View>
              <Chip
                compact
                style={[styles.chip, { backgroundColor: estadoColors[estado] || '#9E9E9E' }]}
                textStyle={styles.chipText}
              >
                {estadoLabels[estado] || estado}
              </Chip>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
              {mascota.raza || 'Mestizo'} • {edadDisplay} {mascota.tamano ? `• ${mascota.tamano}` : ''}
            </Text>
            {mascota.descripcion && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                numberOfLines={2}
              >
                {mascota.descripcion}
              </Text>
            )}
          </Card.Content>
        </Card>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  cardWrapperWide: {
    flex: 1,
    marginHorizontal: 8,
    minWidth: 280,
    maxWidth: 400,
  },
  cardWrapperMobile: {
    width: '100%',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cover: {
    height: 180,
  },
  content: {
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  name: {
    fontWeight: '700',
  },
  chip: {
    height: 26,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
