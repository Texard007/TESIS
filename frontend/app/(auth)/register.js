import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  SegmentedButtons,
  Divider,
} from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';

const ROLES = [
  { value: 'adoptante', label: 'Adoptante', icon: 'account-heart' },
  { value: 'rescatista', label: 'Rescatista', icon: 'hand-heart' },
  { value: 'veterinario', label: 'Veterinario', icon: 'medical-bag' },
];

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { register } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [rol, setRol] = useState('adoptante');
  const [showPassword, setShowPassword] = useState(false);

  // Campos condicionales por rol
  const [ingresosAproximados, setIngresosAproximados] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [organizacion, setOrganizacion] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [licencia, setLicencia] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { width } = Dimensions.get('window');
  const isWide = width > 600;

  const validate = () => {
    if (!nombre.trim()) return 'El nombre es requerido.';
    if (!email.trim()) return 'El correo electrónico es requerido.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Ingresa un correo electrónico válido.';
    if (!password) return 'La contraseña es requerida.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
    if (!telefono.trim()) return 'El teléfono es requerido.';
    return null;
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const userData = {
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      rol,
    };

    // Campos condicionales por rol
    if (rol === 'adoptante') {
      userData.ingresos_aproximados = ingresosAproximados
        ? parseFloat(ingresosAproximados)
        : undefined;
      userData.experiencia = experiencia.trim() || undefined;
    } else if (rol === 'rescatista') {
      userData.organizacion = organizacion.trim() || undefined;
      userData.experiencia = experiencia.trim() || undefined;
    } else if (rol === 'veterinario') {
      userData.especialidad = especialidad.trim() || undefined;
      userData.licencia = licencia.trim() || undefined;
    }

    setLoading(true);
    try {
      const result = await register(userData);
      if (result.success) {
        setSuccess('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => {
          router.replace('/(tabs)/mascotas');
        }, 1500);
      } else {
        setError(result.message || 'Error al registrar. Intenta de nuevo.');
      }
    } catch (err) {
      const response = err.response?.data;
      if (response?.message) {
        setError(response.message);
      } else {
        // Si no hay conexión con el backend, registrar localmente y entrar a la app
        try {
          await register({ nombre, email, password, telefono, direccion, rol });
          router.replace('/(tabs)/mascotas');
          return;
        } catch (e2) {
          setError('Error al registrar. Intenta de nuevo.');
        }
      }
    } finally {
      setLoading(false);
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
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 72, height: 72, marginBottom: 8, alignSelf: 'center' }}
              resizeMode="contain"
            />
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              Crear Cuenta
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
            >
              Únete a nuestra comunidad de adopción
            </Text>
          </View>

          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            elevation={2}
          >
            <Card.Content style={styles.cardContent}>
              {/* Mensajes */}
              {error ? (
                <View
                  style={[
                    styles.messageBox,
                    { backgroundColor: theme.colors.errorContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={20}
                    color={theme.colors.error}
                  />
                  <Text style={[styles.messageText, { color: theme.colors.error }]}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {success ? (
                <View
                  style={[
                    styles.messageBox,
                    { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={theme.colors.secondary}
                  />
                  <Text style={[styles.messageText, { color: theme.colors.secondary }]}>
                    {success}
                  </Text>
                </View>
              ) : null}

              {/* Selector de Rol */}
              <Text
                variant="labelLarge"
                style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
              >
                Tipo de cuenta
              </Text>
              <SegmentedButtons
                value={rol}
                onValueChange={setRol}
                buttons={ROLES.map((r) => ({
                  value: r.value,
                  label: r.label,
                  icon: r.icon,
                }))}
                style={styles.segmented}
              />

              <Divider style={styles.divider} />

              {/* Datos básicos */}
              <Text
                variant="labelLarge"
                style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
              >
                Datos personales
              </Text>

              <TextInput
                label="Nombre completo"
                value={nombre}
                onChangeText={setNombre}
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
              />

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
                disabled={loading}
              />

              <TextInput
                label="Teléfono"
                value={telefono}
                onChangeText={setTelefono}
                mode="outlined"
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
              />

              <TextInput
                label="Dirección"
                value={direccion}
                onChangeText={setDireccion}
                mode="outlined"
                left={<TextInput.Icon icon="map-marker" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
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
                disabled={loading}
              />

              <TextInput
                label="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock-check" />}
                style={styles.input}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                disabled={loading}
              />

              {/* Campos condicionales por rol */}
              {rol === 'adoptante' && (
                <>
                  <Divider style={styles.divider} />
                  <Text
                    variant="labelLarge"
                    style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
                  >
                    Perfil de adoptante
                  </Text>
                  <TextInput
                    label="Ingresos aproximados (Bs./mes)"
                    value={ingresosAproximados}
                    onChangeText={setIngresosAproximados}
                    mode="outlined"
                    keyboardType="numeric"
                    left={<TextInput.Icon icon="cash" />}
                    style={styles.input}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    disabled={loading}
                  />
                  <TextInput
                    label="Experiencia previa con mascotas"
                    value={experiencia}
                    onChangeText={setExperiencia}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    left={<TextInput.Icon icon="heart" />}
                    style={styles.input}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    disabled={loading}
                  />
                </>
              )}

              {rol === 'rescatista' && (
                <>
                  <Divider style={styles.divider} />
                  <Text
                    variant="labelLarge"
                    style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
                  >
                    Perfil de rescatista
                  </Text>
                  <TextInput
                    label="Organización / Fundación"
                    value={organizacion}
                    onChangeText={setOrganizacion}
                    mode="outlined"
                    left={<TextInput.Icon icon="home-group" />}
                    style={styles.input}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    disabled={loading}
                  />
                  <TextInput
                    label="Experiencia en rescate"
                    value={experiencia}
                    onChangeText={setExperiencia}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    left={<TextInput.Icon icon="hand-heart" />}
                    style={styles.input}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    disabled={loading}
                  />
                </>
              )}

              {rol === 'veterinario' && (
                <>
                  <Divider style={styles.divider} />
                  <Text
                    variant="labelLarge"
                    style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
                  >
                    Perfil profesional
                  </Text>
                  <TextInput
                    label="Especialidad"
                    value={especialidad}
                    onChangeText={setEspecialidad}
                    mode="outlined"
                    left={<TextInput.Icon icon="stethoscope" />}
                    style={styles.input}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    disabled={loading}
                  />
                  <TextInput
                    label="Número de licencia"
                    value={licencia}
                    onChangeText={setLicencia}
                    mode="outlined"
                    left={<TextInput.Icon icon="card-account-details" />}
                    style={styles.input}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    disabled={loading}
                  />
                </>
              )}

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
                buttonColor={theme.colors.primary}
              >
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </Button>

              <View style={styles.loginRow}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  ¿Ya tienes cuenta?{' '}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <Button mode="text" compact textColor={theme.colors.primary}>
                    Inicia sesión
                  </Button>
                </Link>
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
    maxWidth: 520,
    alignSelf: 'center',
  },
  contentWide: {
    maxWidth: 480,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  messageText: {
    flex: 1,
    fontWeight: '500',
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 12,
  },
  segmented: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 12,
  },
  registerButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
});
