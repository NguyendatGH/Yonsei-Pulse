import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge } from '@/components/ui';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface DictationResultsProps {
  score: number;
  totalBlanks: number;
  correctCount: number;
  onRestart: () => void;
  onExit: () => void;
}

export function DictationResults({ score, totalBlanks, correctCount, onRestart, onExit }: DictationResultsProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="trophy" size={48} color="#FBBF24" />
        </View>
        <Text style={styles.title}>Hoàn thành!</Text>
        <Text style={styles.subtitle}>Bạn đã hoàn thành bài luyện chính tả</Text>
      </View>

      <View style={styles.statsRow}>
        <Card variant="elevated" style={styles.statCard}>
          <Text style={styles.statLabel}>Điểm số</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{score}%</Text>
        </Card>
        <Card variant="elevated" style={styles.statCard}>
          <Text style={styles.statLabel}>Độ chính xác</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>{correctCount}/{totalBlanks}</Text>
        </Card>
      </View>

      <Card variant="outlined" style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconBox}>
            <Ionicons name="flash" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Kinh nghiệm</Text>
            <Text style={styles.summaryValue}>+{score} XP</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <View style={styles.summaryIconBox}>
            <Ionicons name="time" size={20} color="#60A5FA" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Thời gian</Text>
            <Text style={styles.summaryValue}>--:--</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button title="Luyện tập lại" onPress={onRestart} fullWidth variant="primary" size="lg" style={styles.btn} />
        <Button title="Thoát" onPress={onExit} fullWidth variant="ghost" size="lg" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  summaryCard: {
    padding: 0,
    marginBottom: 40,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  actions: {
    gap: 12,
  },
  btn: {
    borderRadius: Radius.xl,
  },
});
