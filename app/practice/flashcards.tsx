import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { ProgressBar } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { useFlashcards } from '@/hooks/use-flashcards';

export default function FlashcardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setId } = useLocalSearchParams<{ setId: string }>();
  
  const { cards, loading, markMastered } = useFlashcards(setId || 'fs1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = React.useRef(new Animated.Value(0)).current;

  // Speak function
  const speak = (text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.9 });
  };

  React.useEffect(() => {
    if (cards.length > 0 && cards[currentIndex]) {
      speak(cards[currentIndex].korean);
    }
  }, [currentIndex, cards]);

  if (loading || cards.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <LinearGradient colors={['#FFF0F3', '#FFE4E8']} style={StyleSheet.absoluteFill} />
        <Text style={styles.loadingTxt}>Đang chuẩn bị bộ thẻ...</Text>
      </View>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = (currentIndex + 1) / cards.length;

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
      if (!isFlipped) {
         // Optionally speak on flip to back? Or only on front.
      }
    });
  };

  const handleNext = async (mastered: boolean) => {
    if (mastered) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await markMastered(currentCard.id, true);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    } else {
      router.push('/practice/lesson-complete');
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="close-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progHeaderBox}>
           <ProgressBar progress={progress} height={10} color={Colors.primary} style={styles.mainProg} />
           <Text style={styles.progLabel}>Thẻ {currentIndex + 1} của {cards.length}</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
           <Ionicons name="ellipsis-horizontal-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardArea}>
        <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.flipWrapper}>
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
            ]}
          >
            <View style={styles.cardInner}>
              <Text style={styles.labelKr}>TIẾNG HÀN</Text>
              <Text style={styles.txtKr}>{currentCard.korean}</Text>
              <Text style={styles.txtPrn}>[{currentCard.pronunciation}]</Text>
              
              <TouchableOpacity 
                style={styles.speakButton} 
                activeOpacity={0.8}
                onPress={() => speak(currentCard.korean)}
              >
                 <LinearGradient colors={[Colors.primary, '#F28C9D']} style={styles.speakGrad}>
                    <Ionicons name="volume-medium-outline" size={32} color={Colors.white} />
                 </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.infoHint}>
               <Ionicons name="sync-outline" size={14} color={Colors.textTertiary} />
               <Text style={styles.hintTxt}>Chạm để lật xem nghĩa</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              { transform: [{ rotateY: backInterpolate }] },
            ]}
          >
            <View style={styles.cardInner}>
              <Text style={[styles.labelKr, { color: Colors.accent }]}>NGHĨA TIẾNG VIỆT</Text>
              <Text style={styles.txtVie}>{currentCard.vietnamese}</Text>
              
              <View style={styles.exBox}>
                 <Text style={styles.exHead}>VÍ DỤ TRỰC QUAN</Text>
                 <Text style={styles.exKr}>{currentCard.example}</Text>
                 <Text style={styles.exVie}>{currentCard.exampleVi}</Text>
              </View>
            </View>
            <View style={styles.infoHint}>
               <Ionicons name="sync-outline" size={14} color={Colors.textTertiary} />
               <Text style={styles.hintTxt}>Chạm để lật lại</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={[styles.controlFooter, { paddingBottom: insets.bottom + 30 }]}>
        <View style={styles.btnRow}>
           <TouchableOpacity style={styles.btnForgot} onPress={() => handleNext(false)} activeOpacity={0.8}>
              <Text style={styles.txtForgot}>Quên rồi</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.btnRemember} onPress={() => handleNext(true)} activeOpacity={0.8}>
              <LinearGradient colors={[Colors.primary, '#F28C9D']} style={styles.btnRememberGrad}>
                 <Text style={styles.txtRemember}>Đã thuộc</Text>
                 <Ionicons name="chevron-forward" size={18} color={Colors.white} />
              </LinearGradient>
           </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTxt: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  progHeaderBox: {
    flex: 1,
    marginHorizontal: 20,
    gap: 8,
  },
  mainProg: {
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
  },
  progLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textTertiary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardArea: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  flipWrapper: {
    width: '100%',
    aspectRatio: 0.75,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderRadius: Radius['4xl'],
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Shadows.xl,
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardInner: {
    alignItems: 'center',
    width: '100%',
  },
  labelKr: {
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
    marginBottom: 25,
    textTransform: 'uppercase',
  },
  txtKr: {
    fontSize: 64,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  txtPrn: {
    fontSize: 20,
    color: Colors.textTertiary,
    marginTop: 12,
    fontWeight: Typography.weights.medium,
  },
  speakButton: {
    marginTop: 45,
    ...Shadows.md,
  },
  speakGrad: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtVie: {
    fontSize: 44,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  exBox: {
    marginTop: 40,
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: Radius['3xl'],
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  exHead: {
    fontSize: 11,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textTertiary,
    letterSpacing: 2,
  },
  exKr: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  exVie: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: Typography.weights.medium,
  },
  infoHint: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintTxt: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
  },
  controlFooter: {
    paddingHorizontal: Spacing.xl,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  btnForgot: {
    flex: 1,
    height: 64,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  btnRemember: {
    flex: 1.5,
    height: 64,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    ...Shadows.md,
  },
  btnRememberGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  txtForgot: {
    fontSize: 16,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textSecondary,
  },
  txtRemember: {
    fontSize: 17,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
  },
});
