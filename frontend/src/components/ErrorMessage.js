import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ErrorMessage({
  message = 'Ha ocurrido un error. Intenta de nuevo.',
  onRetry,
}) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.errorContainer }]}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={24}
        color={theme.colors.error}
      />
      <Text
        variant="bodyMedium"
        style={[styles.text, { color: theme.colors.error }]}
      >
        {message}
      </Text>
      {onRetry && (
        <Button
          mode="text"
          onPress={onRetry}
          textColor={theme.colors.error}
          compact
        >
          Reintentar
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    gap: 8,
  },
  text: {
    flex: 1,
  },
});
