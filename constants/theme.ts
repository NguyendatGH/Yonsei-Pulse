/**
 * Design tokens aligned with Stitch project: Pastel Pink Korean Learning App
 * Font: Lexend | Roundness: 8px | Primary: #2b8cee | Light mode
 */

import { Platform } from 'react-native';

// ─── Color Palette ───────────────────────────────────────────
export const Colors = {
  // Primary brand (Vibrant Pink)
  primary: '#EF5FA0',
  primaryLight: '#FCE7F3',
  primaryDark: '#D44D87',

  // Pastel accent
  accent: '#F28C9D',
  accentLight: '#FFF0F3',
  accentDark: '#E8899A',

  // Pastel variants
  pastelPink: '#FFD4DC',
  pastelBlue: '#E0F2FE',
  pastelGreen: '#DCFCE7',
  pastelYellow: '#FEF3C7',
  pastelPurple: '#F3E8FF',
  pastelOrange: '#FFEDD5',

  // Neutrals
  white: '#FFFFFF',
  background: '#FFFFFF', // Changed to pure white as per images
  surface: '#FFFFFF',
  surfaceSecondary: '#FFF0F3',
  border: '#F3F4F6',
  borderLight: '#F9FAFB',

  // Text
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#111827',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Gradients
  gradientPink: ['#EF5FA0', '#F28C9D'] as const,
  gradientLight: ['#FFF0F3', '#FFFFFF'] as const,
  gradientPrimary: ['#EF5FA0', '#D44D87'] as const,

  // Overlay
  overlay: 'rgba(0,0,0,0.3)',
  overlayLight: 'rgba(255,255,255,0.8)',
} as const;

// ─── Typography ──────────────────────────────────────────────
export const Typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),

  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ─── Border Radius ───────────────────────────────────────────
export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────
export const Shadows = {
  sm: Platform.select({
    web: {
      boxShadow: '0px 2px 4px rgba(239, 95, 160, 0.05)',
    },
    default: {
      shadowColor: '#EF5FA0',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
  md: Platform.select({
    web: {
      boxShadow: '0px 6px 12px rgba(239, 95, 160, 0.08)',
    },
    default: {
      shadowColor: '#EF5FA0',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
  }),
  lg: Platform.select({
    web: {
      boxShadow: '0px 12px 24px rgba(239, 95, 160, 0.1)',
    },
    default: {
      shadowColor: '#EF5FA0',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    },
  }),
  primaryGlow: Platform.select({
    web: {
      boxShadow: '0px 8px 16px rgba(239, 95, 160, 0.15)',
    },
    default: {
      shadowColor: '#EF5FA0',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
    },
  }),
} as const;

// ─── Animation ───────────────────────────────────────────────
export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;
