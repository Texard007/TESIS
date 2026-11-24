import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip, Searchbar, useTheme } from 'react-native-paper';

const ESPECIES = [
  { key: '', label: 'Todas' },
  { key: 'perro', label: '🐕 Perros' },
  { key: 'gato', label: '🐱 Gatos' },
  { key: 'ave', label: '🐦 Aves' },
  { key: 'conejo', label: '🐰 Conejos' },
  { key: 'otro', label: '🐾 Otros' },
];

const ESTADOS = [
  { key: '', label: 'Todos' },
  { key: 'en_adopcion', label: 'Disponible' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'adoptado', label: 'Adoptado' },
  { key: 'en_tratamiento', label: 'En tratamiento' },
];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  especieFilter,
  onEspecieChange,
  estadoFilter,
  onEstadoChange,
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar mascotas..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.primary}
        inputStyle={{ color: theme.colors.onSurface }}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {ESPECIES.map((esp) => (
          <Chip
            key={`esp-${esp.key}`}
            selected={especieFilter === esp.key}
            onPress={() => onEspecieChange(esp.key)}
            style={[
              styles.chip,
              especieFilter === esp.key && { backgroundColor: theme.colors.primaryContainer },
            ]}
            textStyle={
              especieFilter === esp.key
                ? { color: theme.colors.onPrimaryContainer, fontWeight: '600' }
                : { color: theme.colors.onSurfaceVariant }
            }
            showSelectedOverlay
          >
            {esp.label}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {ESTADOS.map((est) => (
          <Chip
            key={`est-${est.key}`}
            selected={estadoFilter === est.key}
            onPress={() => onEstadoChange(est.key)}
            style={[
              styles.chip,
              estadoFilter === est.key && { backgroundColor: theme.colors.secondaryContainer },
            ]}
            textStyle={
              estadoFilter === est.key
                ? { color: theme.colors.onSecondaryContainer, fontWeight: '600' }
                : { color: theme.colors.onSurfaceVariant }
            }
            showSelectedOverlay
          >
            {est.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  searchbar: {
    marginBottom: 10,
    elevation: 1,
    borderRadius: 12,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
});
