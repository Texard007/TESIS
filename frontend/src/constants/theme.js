import { DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#E65100',
    primaryContainer: '#FFE0B2',
    secondary: '#2E7D32',
    secondaryContainer: '#C8E6C9',
    tertiary: '#5D4037',
    tertiaryContainer: '#D7CCC8',
    surface: '#FFFFFF',
    surfaceVariant: '#FFF8E1',
    background: '#FFF3E0',
    error: '#D32F2F',
    errorContainer: '#FFCDD2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#BF360C',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#1B5E20',
    onSurface: '#3E2723',
    onSurfaceVariant: '#5D4037',
    onBackground: '#3E2723',
    onError: '#FFFFFF',
    outline: '#BCAAA4',
    elevation: {
      level0: 'transparent',
      level1: '#FFF8E1',
      level2: '#FFF3E0',
      level3: '#FFECB3',
      level4: '#FFE0B2',
      level5: '#FFD54F',
    },
  },
  roundness: 12,
  fonts: {
    ...DefaultTheme.fonts,
  },
};

export default theme;
