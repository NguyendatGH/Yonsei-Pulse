import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface ProgressBarProps {
  readonly progress: number; // 0 to 1
  readonly height?: number;
  readonly color?: string;
  readonly backgroundColor?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly showGlow?: boolean;
}

export function ProgressBar({
  progress,
  height = 8,
  color = Colors.primary,
  backgroundColor = Colors.primaryLight,
  style,
  showGlow = false,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
            height,
          },
          showGlow && {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 3,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
