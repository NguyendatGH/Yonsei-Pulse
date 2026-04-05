import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

interface CardProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly variant?: 'default' | 'elevated' | 'outlined' | 'accent';
  readonly padding?: keyof typeof Spacing;
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'base',
}: CardProps) {
  return (
    <View style={[styles.base, VARIANT_MAP[variant], { padding: Spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
});

const VARIANT_MAP = StyleSheet.create({
  default: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  elevated: {
    backgroundColor: Colors.white,
    ...Shadows.md,
  },
  outlined: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accent: {
    backgroundColor: Colors.accentLight,
    ...Shadows.sm,
  },
});
