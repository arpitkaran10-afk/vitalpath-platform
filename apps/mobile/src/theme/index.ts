// MD3-inspired color tokens for VitalPath
export const colors = {
  primary: '#1B6CA8',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D3E4F7',
  onPrimaryContainer: '#002D57',

  secondary: '#00897B',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#B2DFDB',
  onSecondaryContainer: '#00251F',

  tertiary: '#F57C00',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFE0B2',
  onTertiaryContainer: '#4A1800',

  error: '#BA1A1A',
  errorContainer: '#FFDAD6',

  surface: '#F8FAFC',
  surfaceVariant: '#EEF2F7',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#42474E',
  outline: '#72787E',
  outlineVariant: '#C2C7CF',

  background: '#F4F6F9',
  onBackground: '#1A1C1E',

  inverseSurface: '#2E3135',
  inverseOnSurface: '#F0F0F4',

  success: '#2E7D32',
  successContainer: '#E8F5E9',
  warning: '#E65100',
  warningContainer: '#FFF3E0',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const typography = {
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: '400' as const },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '400' as const },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: '400' as const },
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '600' as const },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '600' as const },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '600' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const elevation = {
  level0: {},
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
};
