import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';

export default function LessonCompleteScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.accentLight, Colors.white]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconOuter}>
              <Ionicons name="sparkles" size={64} color={Colors.primary} />
            </View>
          </View>

          <View style={styles.textSection}>
            <Text style={styles.title}>Tuyệt vời!</Text>
            <Text style={styles.subtitle}>Bạn vừa hoàn thành một bài luyện tập mới. Cùng xem thành tích nhé!</Text>
          </View>

          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statContainer}>
              <Text style={styles.statLabel}>Kinh nghiệm</Text>
              <Text style={styles.statValue}>+25 XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statContainer}>
              <Text style={styles.statLabel}>Độ chính xác</Text>
              <Text style={styles.statValue}>95%</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statContainer}>
              <Text style={styles.statLabel}>Thời gian</Text>
              <Text style={styles.statValue}>4:32</Text>
            </View>
          </Card>

          <Button
            title="Tiếp tục"
            variant="primary"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
            style={styles.doneButton}
          />
          <TouchableOpacity 
            style={styles.reviewButton}
            onPress={() => router.back()}
          >
            <Text style={styles.reviewButtonText}>Xem lại đáp án</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing['3xl'],
    ...Shadows.lg,
  },
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 22,
  },
  statsCard: {
    flexDirection: 'row',
    width: '100%',
    padding: Spacing.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  statContainer: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
  },
  statValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  doneButton: {
    paddingHorizontal: Spacing.xl,
  },
  reviewButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  reviewButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
    textDecorationLine: 'underline',
  },
});
