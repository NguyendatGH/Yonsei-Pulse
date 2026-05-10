import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, ProgressBar } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { flashcardRepo, Flashcard } from '@/db/repos/flashcardRepo';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SRSReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ mastered: number; total: number }>({ mastered: 0, total: 0 });

  // Animation values
  const flipAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDueCards();
  }, []);

  const loadDueCards = async () => {
    try {
      setLoading(true);
      const dueCards = await flashcardRepo.getDueCards();
      setCards(dueCards);
    } catch (err) {
      console.error('Failed to load due cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const speak = (text: string) => {
    Speech.speak(text, { language: 'ko-KR' });
  };

  const handleReview = async (quality: number) => {
    const card = cards[currentIndex];
    await flashcardRepo.markMastered(card.id, quality);
    
    if (quality >= 4) {
      setResults(prev => ({ ...prev, mastered: prev.mastered + 1 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    } else {
      // Finish review
      router.push({
        pathname: '/practice/lesson-complete',
        params: {
          mastered: results.mastered + (quality >= 4 ? 1 : 0),
          total: cards.length,
          xp: (results.mastered + (quality >= 4 ? 1 : 0)) * 10,
          timeTaken: '5:00', // Mock time
        }
      });
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ôn tập SRS</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={80} color={Colors.success} />
          <Text style={styles.emptyTitle}>Tuyệt vời!</Text>
          <Text style={styles.emptySub}>Bạn đã hoàn thành tất cả các thẻ cần ôn tập hôm nay.</Text>
          <Button title="Quay lại" onPress={() => router.back()} style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = (currentIndex + 1) / cards.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ôn tập hàng ngày</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.progressBox}>
        <ProgressBar progress={progress} height={6} color={Colors.primary} />
        <Text style={styles.progressText}>Thẻ {currentIndex + 1} / {cards.length}</Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity activeOpacity={1} onPress={handleFlip} style={styles.flipWrapper}>
          <Animated.View style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }, isFlipped && { opacity: 0 }]}>
            <Text style={styles.wordText}>{currentCard.korean}</Text>
            <TouchableOpacity onPress={() => speak(currentCard.korean)} style={styles.speakerBtn}>
              <Ionicons name="volume-medium" size={32} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.flipHint}>Chạm để xem nghĩa</Text>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }, !isFlipped && { opacity: 0 }]}>
            <Text style={styles.meaningText}>{currentCard.vietnamese}</Text>
            <Text style={styles.exampleText}>{currentCard.example}</Text>
            <Text style={styles.flipHint}>Chạm để quay lại</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {!isFlipped ? (
          <Button title="Hiện đáp án" onPress={handleFlip} fullWidth size="lg" />
        ) : (
          <View style={styles.qualityButtons}>
            <TouchableOpacity style={[styles.qBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleReview(1)}>
              <Text style={[styles.qBtnText, { color: '#B91C1C' }]}>Quên</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.qBtn, { backgroundColor: '#FEF3C7' }]} onPress={() => handleReview(3)}>
              <Text style={[styles.qBtnText, { color: '#B45309' }]}>Khó</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.qBtn, { backgroundColor: '#D1FAE5' }]} onPress={() => handleReview(5)}>
              <Text style={[styles.qBtnText, { color: '#047857' }]}>Dễ</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  progressBox: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  flipWrapper: {
    width: '100%',
    height: SCREEN_WIDTH * 1.2,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backfaceVisibility: 'hidden',
    ...Shadows.lg,
  },
  cardBack: {
    backgroundColor: '#FCE7F3',
  },
  wordText: {
    fontSize: 48,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
    marginBottom: 24,
  },
  meaningText: {
    fontSize: 32,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  exampleText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  speakerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  flipHint: {
    position: 'absolute',
    bottom: 32,
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  qBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qBtnText: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
