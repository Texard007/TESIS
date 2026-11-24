import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, loginDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const { width } = Dimensions.get('window');
  const isWide = width > 600;

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        router.replace('/(tabs)/mascotas');
      } else {
        setError(result.message || 'Credenciales incorrectas.');
      }
    } catch (err) {
      const response = err.response?.data;
      if (response?.message) {
        setError(response.message);
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError(
          'No se pudo conectar con el servidor backend (puerto 4000). Puedes usar el botón de "Modo Demostración" abajo para entrar sin conexión.'
        );
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (rol) => {
    setError('');
    setDemoLoading(true);
    try {
      await loginDemo(rol);
      router.replace('/(tabs)/mascotas');
    } catch (err) {
      setError('Error al iniciar el modo demostración.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, isWide && styles.contentWide]}>
          {/* Logo / Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="paw"
              size={64}
              color={theme.colors.primary}
            />
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              Adopción de Mascotas
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Comunidades de Adopción • Estado Zulia
            </Text>
          </View>

          {/* Formulario de Login */}
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            elevation={3}
          >
            <Card.Content style={styles.cardContent}>
              <Text
                variant="titleLarge"
                style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              >
                Iniciar Sesión
              </Text>

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
                  <Text
                    variant="bodyMedium"
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              <TextInput
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading || demoLoading}
              />

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading || demoLoading}
                onSubmitEditing={handleLogin}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || demoLoading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
              >
                {loading ? 'Ingresando...' : 'Ingresar con Servidor'}
              </Button>

              <View style={styles.registerRow}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  ¿No tienes cuenta?{' '}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <Button
                    mode="text"
                    compact
                    textColor={theme.colors.primary}
                  >
                    Regístrate aquí
                  </Button>
                </Link>
              </View>

              <Divider style={{ marginVertical: 18 }} />

              {/* Acceso Rápido / Modo Demo Offline */}
              <View style={styles.demoSection}>
                <View style={styles.demoHeader}>
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={20}
                    color="#FF9800"
                  />
                  <Text
                    variant="labelLarge"
                    style={{ fontWeight: '700', color: theme.colors.onSurface }}
                  >
                    Acceso Rápido (Modo Demo / Sin Servidor)
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12, textAlign: 'center' }}
                >
                  Toca un rol para ingresar al instante y probar la app:
                </Text>

                <View style={styles.chipsGrid}>
                  <Chip
                    icon="account-heart"
                    mode="outlined"
                    style={styles.demoChip}
                    onPress={() => handleDemoAccess('adoptante')}
                    disabled={loading || demoLoading}
                  >
                    Adoptante
                  </Chip>
                  <Chip
                    icon="hand-heart"
                    mode="outlined"
                    style={styles.demoChip}
                    onPress={() => handleDemoAccess('rescatista')}
                    disabled={loading || demoLoading}
                  >
                    Rescatista
                  </Chip>
                  <Chip
                    icon="medical-bag"
                    mode="outlined"
                    style={styles.demoChip}
                    onPress={() => handleDemoAccess('veterinario')}
                    disabled={loading || demoLoading}
                  >
                    Veterinario
                  </Chip>
                  <Chip
                    icon="shield-crown"
                    mode="outlined"
                    style={styles.demoChip}
                    onPress={() => handleDemoAccess('administrador')}
                    disabled={loading || demoLoading}
                  >
                    Admin
                  </Chip>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    paddingVertical: 32,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  contentWide: {
    maxWidth: 440,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 6,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  demoSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  demoChip: {
    backgroundColor: '#FFFFFF',
  },
});
