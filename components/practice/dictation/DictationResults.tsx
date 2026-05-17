import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/ui';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { flashcardRepo } from '@/db/repos/flashcardRepo';
import { statsRepo } from '@/db/repos/statsRepo';

interface DictationResultsProps {
  score: number;
  totalBlanks: number;
  correctCount: number;
  onRestart: () => void;
  onExit: () => void;
  wordParts?: {
    id: string | number;
    display: string;
    isBlank: boolean;
    userInput: string;
    original: string;
  }[];
}

export function DictationResults({ score, totalBlanks, correctCount, onRestart, onExit, wordParts }: DictationResultsProps) {
  const [showReview, setShowReview] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [customMeaning, setCustomMeaning] = useState('');
  const [savedCards, setSavedCards] = useState<{word: string, meaning: string}[]>([]);

  React.useEffect(() => {
    statsRepo.logDictationSession(score, totalBlanks, correctCount);
  }, [score, totalBlanks, correctCount]);

  const handleCreateCustomFlashcard = async () => {
    if (!customWord.trim() || !customMeaning.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập cả từ tiếng Hàn và nghĩa tiếng Việt.');
      return;
    }
    try {
      await flashcardRepo.addCardToSet('fs1', customWord.trim(), customMeaning.trim());
      setSavedCards(prev => [...prev, { word: customWord.trim(), meaning: customMeaning.trim() }]);
      setCustomWord('');
      setCustomMeaning('');
    } catch (e) {
      console.error('Error adding card:', e);
      Alert.alert('Lỗi', 'Không thể thêm từ vựng vào Flashcard.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

      {/* Full Script Section */}
      {wordParts && wordParts.length > 0 && (
        <Card variant="outlined" style={styles.fullScriptCard}>
          <View style={styles.scriptHeader}>
            <Ionicons name="document-text" size={20} color={Colors.primary} />
            <Text style={styles.scriptTitle}>Script bài luyện</Text>
          </View>
          
          <View style={styles.reviewParagraph}>
            {wordParts.map((part) => {
              if (part.isBlank) {
                const isCorrect = part.userInput.trim().toLowerCase() === part.original.trim().toLowerCase();
                return (
                  <Text 
                    key={part.id} 
                    style={[
                      styles.reviewWord, 
                      isCorrect ? styles.reviewWordCorrect : styles.reviewWordWrong
                    ]}
                  >
                    {part.original} {`(${part.userInput ? part.userInput : 'trống'})`}{' '}
                  </Text>
                );
              }
              return (
                <Text key={part.id} style={styles.reviewTextNormal}>
                  {part.display}{' '}
                </Text>
              );
            })}
          </View>
        </Card>
      )}

      {/* Manual Flashcard Creation Form */}
      <Card variant="outlined" style={styles.flashcardFormCard}>
        <Text style={styles.vocabSectionTitle}>Tạo thẻ Flashcard mới</Text>
        <Text style={styles.vocabSectionDesc}>Nhìn vào script bên trên, chọn từ vựng bạn muốn học và lưu vào kho nhé.</Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.textInput}
            placeholder="Từ tiếng Hàn..."
            value={customWord}
            onChangeText={setCustomWord}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Nghĩa tiếng Việt..."
            value={customMeaning}
            onChangeText={setCustomMeaning}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <Button 
          title="Lưu thẻ vào kho" 
          onPress={handleCreateCustomFlashcard} 
          variant="secondary" 
          icon={<Ionicons name="save-outline" size={18} color={Colors.primary} />}
        />

        {savedCards.length > 0 && (
          <View style={styles.savedCardsList}>
            <Text style={styles.savedCardsTitle}>Đã lưu ({savedCards.length}):</Text>
            {savedCards.map((card, idx) => (
              <View key={idx} style={styles.savedCardItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.savedCardWord}>{card.word}</Text>
                <Text style={styles.savedCardMeaning}>- {card.meaning}</Text>
              </View>
            ))}
          </View>
        )}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: Radius.xl,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  fullScriptCard: {
    padding: 20,
    marginBottom: 24,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scriptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  reviewParagraph: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    lineHeight: 28,
  },
  reviewWord: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  reviewWordCorrect: {
    color: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  reviewWordWrong: {
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  reviewTextNormal: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 26,
  },
  flashcardFormCard: {
    padding: 20,
    marginBottom: 24,
    borderRadius: Radius.xl,
    backgroundColor: '#FDF2F8', // very light pink bg for flashcard area
    borderColor: '#FCE7F3',
  },
  vocabSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  vocabSectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 12,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  savedCardsList: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FCE7F3',
  },
  savedCardsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  savedCardWord: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  savedCardMeaning: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actions: {
    gap: 12,
  },
  btn: {
    borderRadius: Radius.xl,
  },
});
