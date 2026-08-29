import { StyleSheet, Platform } from 'react-native';
import COLORS from './colors';

// Named export for COLORS
export { COLORS };

// Expo template / Theme color definitions
const tintColorLight = '#F97316';
const tintColorDark = '#FB923C';

export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#4B5563',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#FFEDD5',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    background: '#121212',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    backgroundElement: '#1F2937',
    backgroundSelected: '#7C2D12',
  },
};

export type ThemeColor = keyof typeof Colors.light;

// Spacing for template components
export const Spacing = {
  half: 4,
  one: 8,
  two: 16,
  three: 24,
  four: 32,
  five: 40,
};

export const MaxContentWidth = 1200;

// Application Design System Tokens
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  round: 9999,
};

export const FONTS = {
  mono: 'SpaceMono',
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 30,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// Aliased for template component compatibility
export const Fonts = FONTS;

export const SHADOWS = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      } as any,
    }),
  },
  cardHover: {
    ...Platform.select({
      ios: {
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 6px 16px rgba(249, 115, 22, 0.14)',
      } as any,
    }),
  },
  buttonPrimary: {
    ...Platform.select({
      ios: {
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
      } as any,
    }),
  },
  floatingBar: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      } as any,
    }),
  },
});

export default {
  COLORS,
  Colors,
  SPACING,
  Spacing,
  RADIUS,
  FONTS,
  Fonts,
  SHADOWS,
  MaxContentWidth,
};

