import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

interface BadgeProps {
  readonly label: string;
  readonly variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  readonly size?: 'sm' | 'md';
  readonly style?: StyleProp<ViewStyle>;
}

export function Badge({ label, variant = 'default', size = 'sm', style }: BadgeProps) {
  const variantStyle = VARIANT_MAP[variant];
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
    text: { fontSize: Typography.sizes.xs },
  },
  md: {
    container: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
    text: { fontSize: Typography.sizes.sm },
  },
} as const;

const VARIANT_MAP = StyleSheet.create({
  default: {
    container: { backgroundColor: Colors.primaryLight },
    text: { color: Colors.primary },
  },
  success: {
    container: { backgroundColor: Colors.successLight },
    text: { color: '#059669' },
  },
  warning: {
    container: { backgroundColor: Colors.warningLight },
    text: { color: '#D97706' },
  },
  error: {
    container: { backgroundColor: Colors.errorLight },
    text: { color: '#DC2626' },
  },
  info: {
    container: { backgroundColor: Colors.infoLight },
    text: { color: '#2563EB' },
  },
  accent: {
    container: { backgroundColor: Colors.accentLight },
    text: { color: Colors.accentDark },
  },
});
