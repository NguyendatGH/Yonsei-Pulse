import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
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
  
  const [showReview, setShowReview] = useState(false);
  
  const parsedQuestions = params.questions ? JSON.parse(params.questions as string) : [];
  const parsedUserAnswers = params.userAnswers ? JSON.parse(params.userAnswers as string) : {};

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

        <TouchableOpacity style={styles.detailBtn} onPress={() => setShowReview(true)}>
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

      {/* Answer Review Modal */}
      <Modal
        visible={showReview}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowReview(false)}
      >
        <View style={styles.reviewModalContainer}>
          <View style={styles.reviewModalHeader}>
            <TouchableOpacity onPress={() => setShowReview(false)} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.reviewModalTitle}>Chi tiết câu trả lời</Text>
            <View style={{ width: 44 }} />
          </View>

          {parsedQuestions.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTxt}>Không có dữ liệu bài thi để hiển thị.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.reviewScrollContent} showsVerticalScrollIndicator={false}>
              {parsedQuestions.map((q: any, idx: number) => {
                const userAnswer = parsedUserAnswers[idx];
                let isCorrect = false;
                if (q.type === 'multiple_choice') {
                  isCorrect = userAnswer === q.correctAnswer;
                } else {
                  isCorrect = typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === String(q.correctAnswer).toLowerCase();
                }

                return (
                  <Card key={q.id || idx} variant="outlined" style={styles.reviewQuestionCard}>
                    <View style={styles.questionHeader}>
                      <Badge 
                        label={`Câu ${idx + 1}`}
                        variant="info"
                      />
                      <Badge 
                        label={isCorrect ? "Đúng ✓" : "Sai ✗"}
                        variant={isCorrect ? "success" : "error"}
                      />
                    </View>

                    <Text style={styles.reviewQuestionText}>{q.question}</Text>

                    {q.type === 'multiple_choice' ? (
                      <View style={styles.optionsList}>
                        {q.options?.map((option: string, optIdx: number) => {
                          const isUserSelected = userAnswer === optIdx;
                          const isCorrectOpt = q.correctAnswer === optIdx;

                          let optionStyle: any = styles.optionReviewItem;
                          let optionTextStyle: any = styles.optionReviewText;
                          let iconName: any = null;
                          let iconColor = '';

                          if (isCorrectOpt) {
                            optionStyle = [styles.optionReviewItem, styles.optionCorrect];
                            optionTextStyle = [styles.optionReviewText, styles.textCorrect];
                            iconName = "checkmark-circle";
                            iconColor = "#4CAF50";
                          } else if (isUserSelected && !isCorrect) {
                            optionStyle = [styles.optionReviewItem, styles.optionIncorrect];
                            optionTextStyle = [styles.optionReviewText, styles.textIncorrect];
                            iconName = "close-circle";
                            iconColor = "#F44336";
                          }

                          return (
                            <View key={optIdx} style={optionStyle}>
                              <View style={[styles.letterBadge, isCorrectOpt && styles.badgeCorrect, isUserSelected && !isCorrect && styles.badgeIncorrect]}>
                                <Text style={styles.letterBadgeText}>{String.fromCharCode(65 + optIdx)}</Text>
                              </View>
                              <Text style={optionTextStyle}>{option}</Text>
                              {iconName && <Ionicons name={iconName} size={18} color={iconColor} />}
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <View style={styles.blankAnswerBox}>
                        <View style={styles.blankRow}>
                          <Text style={styles.blankLabel}>Câu trả lời của bạn:</Text>
                          <Text style={[styles.blankVal, isCorrect ? styles.textCorrect : styles.textIncorrect]}>
                            {userAnswer || 'Chưa nhập'}
                          </Text>
                        </View>
                        {!isCorrect && (
                          <View style={styles.blankRow}>
                            <Text style={styles.blankLabel}>Đáp án chính xác:</Text>
                            <Text style={[styles.blankVal, styles.textCorrect]}>
                              {q.correctAnswer}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </Card>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  reviewModalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  reviewScrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    gap: Spacing.base,
  },
  reviewQuestionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewQuestionText: {
    fontSize: 16,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
  },
  optionReviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFBFC',
    gap: 12,
  },
  optionReviewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  optionCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  optionIncorrect: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  textCorrect: {
    color: '#2E7D32',
    fontWeight: Typography.weights.extrabold,
  },
  textIncorrect: {
    color: '#C62828',
    fontWeight: Typography.weights.extrabold,
  },
  letterBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCorrect: {
    backgroundColor: '#A5D6A7',
  },
  badgeIncorrect: {
    backgroundColor: '#EF9A9A',
  },
  letterBadgeText: {
    fontSize: 12,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  blankAnswerBox: {
    padding: 16,
    backgroundColor: '#FAFBFC',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  blankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blankLabel: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  blankVal: {
    fontSize: 14,
    fontWeight: Typography.weights.extrabold,
  },
  emptyTxt: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
