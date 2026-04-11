import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

interface BadgeProps {
  readonly label: string;
  readonly variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'outlined';
  readonly size?: 'sm' | 'md';
  readonly style?: StyleProp<ViewStyle>;
}

export function Badge({ label, variant = 'default', size = 'sm', style }: BadgeProps) {
  const variantStyle = VARIANT_MAP[variant] || VARIANT_MAP.default;
  const sizeStyle = SIZE_MAP[size];

  return (
    <View style={[styles.base, variantStyle.container, sizeStyle.container, style]}>
      <Text style={[styles.text, variantStyle.text, sizeStyle.text]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'center',
    borderRadius: Radius.full,
  },
  text: {
    fontWeight: Typography.weights.medium,
  },
});

const SIZE_MAP = {
  sm: {
    container: { paddingHorizontal: Spacing.sm, paddingVertical: 2 },
    text: { fontSize: 10 },
  },
  md: {
    container: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
    text: { fontSize: Typography.sizes.sm },
  },
} as const;

const VARIANT_MAP = {
  default: {
    container: { backgroundColor: Colors.primary + '15' },
    text: { color: Colors.primary },
  },
  success: {
    container: { backgroundColor: Colors.success + '15' },
    text: { color: Colors.success },
  },
  warning: {
    container: { backgroundColor: Colors.warning + '15' },
    text: { color: Colors.warning },
  },
  error: {
    container: { backgroundColor: Colors.error + '15' },
    text: { color: Colors.error },
  },
  info: {
    container: { backgroundColor: '#E0F2FE' },
    text: { color: '#0369A1' },
  },
  accent: {
    container: { backgroundColor: Colors.accent + '15' },
    text: { color: Colors.accent },
  },
  outlined: {
    container: { 
      backgroundColor: 'transparent', 
      borderWidth: 1, 
      borderColor: '#E2E8F0' 
    },
    text: { color: Colors.textSecondary },
  },
};
