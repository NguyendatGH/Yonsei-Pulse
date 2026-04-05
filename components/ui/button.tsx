import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Radius, Shadows } from '@/constants/theme';

interface ButtonProps {
  readonly title: string;
  readonly onPress: () => void;
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly icon?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const sizeStyles = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#D1D5DB', '#9CA3AF'] : [Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            sizeStyles.container,
            !isDisabled && Shadows.primaryGlow,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, sizeStyles.text, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = VARIANT_MAP[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              sizeStyles.text,
              { color: variantStyles.textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.xl,
  },
  fullWidth: {
    width: '100%',
  },
  baseText: {
    fontWeight: Typography.weights.semibold,
  },
  primaryText: {
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});

const SIZE_MAP = {
  sm: {
    container: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.lg } as ViewStyle,
    text: { fontSize: Typography.sizes.sm } as TextStyle,
  },
  md: {
    container: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: Radius.xl } as ViewStyle,
    text: { fontSize: Typography.sizes.base } as TextStyle,
  },
  lg: {
    container: { paddingHorizontal: 32, paddingVertical: 18, borderRadius: Radius['2xl'] } as ViewStyle,
    text: { fontSize: Typography.sizes.lg } as TextStyle,
  },
} as const;

const VARIANT_MAP = {
  secondary: {
    container: {
      backgroundColor: Colors.accentLight,
    } as ViewStyle,
    textColor: Colors.primary,
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: Colors.primary,
    } as ViewStyle,
    textColor: Colors.primary,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    } as ViewStyle,
    textColor: Colors.primary,
  },
} as const;
