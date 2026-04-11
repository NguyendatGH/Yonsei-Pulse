import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { useGrammar } from '@/hooks/use-grammar';

export default function GrammarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { grammarId } = useLocalSearchParams<{ grammarId: string }>();
  const { grammarList, loading } = useGrammar();

  const speak = (text: string) => {
    Speech.speak(text, { language: 'ko-KR', rate: 0.9 });
  };

  const selectedGrammar = grammarId 
    ? grammarList.find(g => g.id === grammarId) 
    : grammarList[0];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!selectedGrammar && grammarList.length > 0) {
    // Fallback if ID not found
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ngữ pháp bài học</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {grammarList.map((g) => (
          <CardItem key={g.id} grammar={g} onSpeak={speak} />
        ))}
        
        <View style={styles.readingSection}>
           <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Bài đọc hiểu</Text>
              <TouchableOpacity onPress={() => speak('안녕하세요. 저는 Linh입니다. 한국어를 공부하고 있어요. 학교에서 친구를 만나요. 우리 같이 비빔밥을 먹어요.')}>
                 <Ionicons name="volume-medium" size={24} color={Colors.primary} />
              </TouchableOpacity>
           </View>
           <View style={styles.readingCard}>
              <Text style={styles.readingKr}>
                안녕하세요. 저는 Linh입니다. 한국어를 공부하고 있어요. 학교에서 친구를 만나요. 우리 같이 비빔밥을 먹어요.
              </Text>
              <View style={styles.divider} />
              <Text style={styles.readingVi}>
                Xin chào. Tôi là Linh. Tôi đang học tiếng Hàn. Tôi gặp bạn ở trường. Chúng tôi cùng nhau ăn Bibimbap.
              </Text>
           </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
         <TouchableOpacity style={styles.btnComplete} onPress={() => router.push('/practice/lesson-complete')}>
            <LinearGradient colors={[Colors.primary, '#F28C9D']} style={styles.btnGrad}>
               <Text style={styles.btnTxt}>Đã thuộc ngữ pháp</Text>
            </LinearGradient>
         </TouchableOpacity>
      </View>
    </View>
  );
}

function CardItem({ grammar, onSpeak }: { grammar: any, onSpeak: (t: string) => void }) {
  return (
    <View style={styles.gramCard}>
      <View style={styles.gramHeaderRow}>
         <View style={styles.gramTag}>
           <Text style={styles.tagTxt}>Cấu trúc</Text>
         </View>
         <TouchableOpacity onPress={() => onSpeak(grammar.title)}>
            <Ionicons name="volume-medium-outline" size={24} color={Colors.primary} />
         </TouchableOpacity>
      </View>
      <Text style={styles.gramTitle}>{grammar.title}</Text>
      <Text style={styles.gramDesc}>{grammar.description}</Text>
      
      <View style={styles.exBox}>
         <View style={styles.exHeaderRow}>
            <Text style={styles.exLabel}>VÍ DỤ</Text>
            <TouchableOpacity onPress={() => onSpeak(grammar.example)}>
               <Ionicons name="volume-low" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
         </View>
         <Text style={styles.exKr}>{grammar.example}</Text>
         <Text style={styles.exVi}>Giải thích: {grammar.explanation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    paddingVertical: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.xl,
    gap: 24,
  },
  gramCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius['3xl'],
    padding: 24,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gramTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 16,
  },
  tagTxt: {
    fontSize: 11,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  gramTitle: {
    fontSize: 24,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  gramDesc: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  exBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.xl,
    padding: 20,
    gap: 12,
  },
  exLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
  },
  exKr: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  exVi: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  readingSection: {
    marginTop: 8,
    gap: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  readingCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    padding: 24,
    ...Shadows.sm,
  },
  readingKr: {
    fontSize: 18,
    lineHeight: 30,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  readingVi: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  btnComplete: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  btnGrad: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: Typography.weights.extrabold,
  },
  gramHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  }
});
