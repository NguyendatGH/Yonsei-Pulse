import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Badge, ProgressBar } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { analytics } from '@/services/analytics';
import { MOCK_EXAM_RESULT } from '@/constants/mock-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExamResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const data = params.score !== undefined ? {
    score: Number(params.score),
    totalQuestions: Number(params.totalQuestions),
    correctAnswers: Number(params.correctAnswers),
    timeTaken: params.timeTaken as string,
    passed: params.passed === 'true',
  } : MOCK_EXAM_RESULT;

  React.useEffect(() => {
    analytics.trackExamResult(data.score, data.passed);
  }, [data.score, data.passed]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kết quả thi thử</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreContainer}>
           <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                 <Text style={styles.scoreValue}>{data.score}</Text>
                 <Text style={styles.scorePossible}>/ 100</Text>
              </View>
           </View>
           <Text style={styles.congratsText}>Chúc mừng! Bạn đã hoàn thành</Text>
        </View>

        <View style={styles.statsGrid}>
           <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: '#E8F5E9' }]}>
                 <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statVal}>{data.correctAnswers}</Text>
              <Text style={styles.statLabel}>Đúng</Text>
           </View>
           <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: '#FFEBEE' }]}>
                 <Ionicons name="close-circle" size={24} color="#F44336" />
              </View>
              <Text style={styles.statVal}>{data.totalQuestions - data.correctAnswers}</Text>
              <Text style={styles.statLabel}>Sai</Text>
           </View>
           <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: '#FFF8E1' }]}>
                 <Ionicons name="time" size={24} color="#FFC107" />
              </View>
              <Text style={styles.statVal}>{data.timeTaken}</Text>
              <Text style={styles.statLabel}>Phút</Text>
           </View>
        </View>

        <TouchableOpacity style={styles.detailBtn}>
           <Text style={styles.detailBtnText}>Xem chi tiết câu trả lời</Text>
           <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.actionSection}>
          <Button
            title="Trở về Trang chủ"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
            size="lg"
            style={styles.homeBtn}
          />
          <TouchableOpacity 
            style={styles.retryBtn}
            onPress={() => router.replace('/practice/exam')}
          >
            <Text style={styles.retryBtnText}>Làm lại bài thi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
  },
  scorePossible: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
  },
  congratsText: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 40,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statIconBox: {
    width: 50,
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: Radius.xl,
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailBtnText: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  actionSection: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  homeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
  },
  retryBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textSecondary,
  },
});
