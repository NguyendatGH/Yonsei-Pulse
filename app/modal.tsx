import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function ConfirmationModal() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Card variant="elevated" style={styles.modalCard}>
        <View style={styles.iconBox}>
          <Ionicons name="help-circle" size={48} color={Colors.primary} />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.title}>Xác nhận nộp bài?</Text>
          <Text style={styles.subtitle}>
            Bạn vẫn chưa hoàn thành 3 câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?
          </Text>
        </View>

        <View style={styles.actionGrid}>
          <Button
            title="Quay lại"
            variant="ghost"
            onPress={() => router.back()}
            style={styles.cancelBtn}
          />
          <Button
            title="Nộp bài ngay"
            onPress={() => {
              router.replace('/practice/exam-result');
            }}
            fullWidth
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  modalCard: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionGrid: {
    width: '100%',
    gap: Spacing.md,
  },
  cancelBtn: {
    borderWidth: 0,
  },
});
