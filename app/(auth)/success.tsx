import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
           <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={64} color={Colors.white} />
           </View>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title}>Xác thực thành công</Text>
          <Text style={styles.subtitle}>
            Tài khoản của bạn đã được xác thực thành công. Bắt đầu hành trình chinh phục tiếng Hàn ngay thôi!
          </Text>
        </View>

        <Button
          title="Tiếp tục"
          onPress={() => router.replace('/(tabs)')}
          fullWidth
          size="lg"
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: Spacing['2xl'],
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  textSection: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
    paddingHorizontal: 10,
  },
  actionBtn: {
    marginTop: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
  },
});
