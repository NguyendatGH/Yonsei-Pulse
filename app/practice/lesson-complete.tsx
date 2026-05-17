import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { courseRepo } from '@/db/repos/courseRepo';
import { flashcardRepo, Flashcard } from '@/db/repos/flashcardRepo';
import { analytics } from '@/services/analytics';
import { useUser } from '@/hooks/use-user';
import { statsRepo } from '@/db/repos/statsRepo';
import * as Speech from 'expo-speech';

export default function LessonCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addXp, updateStreak, incrementCompletedPractices } = useUser();

  const [showReview, setShowReview] = useState(false);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  // Read actual stats passed via params, fall back to defaults
  const xpEarned = params.xp ? Number(params.xp) : 25;
  const mastered = params.mastered !== undefined ? Number(params.mastered) : null;
  const total = params.total ? Number(params.total) : null;
  const timeTaken = (params.timeTaken as string) || '—';
  const lessonId = params.lessonId as string;

  React.useEffect(() => {
    if (lessonId) {
      courseRepo.completeLesson(lessonId).catch(console.error);
      const earnedXp = mastered ? Number(mastered) * 10 : 50;
      addXp(earnedXp);
      updateStreak();
      statsRepo.logActivity(15, earnedXp).catch(console.error); // Estimate 15 mins per lesson
      analytics.trackLessonComplete(lessonId, 'unknown', earnedXp);
    } else if (mastered !== null) {
      incrementCompletedPractices();
      addXp(xpEarned);
      updateStreak();
      statsRepo.logActivity(10, xpEarned).catch(console.error);
      analytics.trackFlashcardReview(Number(mastered), Number(total) || 0);
    }
  }, [lessonId, mastered, total, addXp, incrementCompletedPractices, updateStreak, xpEarned]);

  const handleOpenReview = async () => {
    try {
      setShowReview(true);
      setLoadingCards(true);
      const targetSetId = (params.setId as string) || 'fs1';
      const cardsList = await flashcardRepo.getCardsBySetId(targetSetId);
      setReviewCards(cardsList);
    } catch (e) {
      console.error('Failed to load review cards:', e);
    } finally {
      setLoadingCards(false);
    }
  };

  const speak = (text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.9 });
  };

  const accuracy = mastered !== null && total !== null && total > 0
    ? Math.round((mastered / total) * 100)
    : 95;

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
            <Text style={styles.subtitle}>
              {mastered !== null && total !== null
                ? `Bạn đã thuộc ${mastered}/${total} thẻ trong phiên này. Cùng xem thành tích nhé!`
                : 'Bạn vừa hoàn thành một bài luyện tập mới. Cùng xem thành tích nhé!'}
            </Text>
          </View>

          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statContainer}>
              <Text style={styles.statLabel}>Kinh nghiệm</Text>
              <Text style={styles.statValue}>+{xpEarned} XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statContainer}>
              <Text style={styles.statLabel}>Độ chính xác</Text>
              <Text style={styles.statValue}>{accuracy}%</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statContainer}>
              <Text style={styles.statLabel}>Thời gian</Text>
              <Text style={styles.statValue}>{timeTaken}</Text>
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
            onPress={handleOpenReview}
          >
            <Text style={styles.reviewButtonText}>Xem lại đáp án</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
            <Text style={styles.reviewModalTitle}>Danh sách đáp án đã học</Text>
            <View style={{ width: 44 }} />
          </View>

          {loadingCards ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingTxt}>Đang tải danh sách thẻ...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.reviewScrollContent} showsVerticalScrollIndicator={false}>
              {reviewCards.map((card) => (
                <Card key={card.id} variant="outlined" style={styles.reviewCardItem}>
                  <View style={styles.reviewCardMain}>
                    <View style={styles.reviewCardInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={styles.reviewCardKr}>{card.korean}</Text>
                        {card.pronunciation && (
                          <Text style={styles.reviewCardPrn}>[{card.pronunciation}]</Text>
                        )}
                      </View>
                      <Text style={styles.reviewCardVi}>{card.vietnamese}</Text>
                      
                      {card.example && (
                        <View style={styles.reviewExBox}>
                          <Text style={styles.reviewExKr}>{card.example}</Text>
                          <Text style={styles.reviewExVi}>{card.exampleVi}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.reviewActions}>
                      <TouchableOpacity onPress={() => speak(card.korean)} style={styles.speakMiniBtn}>
                        <Ionicons name="volume-medium-outline" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                      
                      <Badge 
                        label={card.mastered ? "Đã thuộc ✨" : "Chưa thuộc"}
                        variant={card.mastered ? "success" : "warning"}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
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
  reviewModalContainer: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingTxt: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reviewScrollContent: {
    padding: 20,
    gap: 16,
  },
  reviewCardItem: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 16,
  },
  reviewCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  reviewCardInfo: {
    flex: 1,
  },
  reviewCardKr: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  reviewCardPrn: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  reviewCardVi: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewExBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    gap: 4,
  },
  reviewExKr: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  reviewExVi: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  reviewActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  speakMiniBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
