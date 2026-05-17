import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    statsRepo.logDictationSession(score, totalBlanks, correctCount);
  }, [score, totalBlanks, correctCount]);

  const handleAddWord = async (word: string) => {
    try {
      let vnDef = "Từ mới từ Dictation";
      if (wordParts) {
        const lowerWord = word.trim().toLowerCase();
        if (lowerWord === '린') vnDef = 'Linh (tên riêng)';
        else if (lowerWord === '공부하고') vnDef = 'Đang học';
        else if (lowerWord === '에서') vnDef = 'Ở, tại, từ';
        else if (lowerWord === '과일') vnDef = 'Trái cây';
        else if (lowerWord === '오천') vnDef = '5000 (năm nghìn)';
        else if (lowerWord === '싸요') vnDef = 'Rẻ';
      }
      await flashcardRepo.addCardToSet('fs1', word, vnDef);
      setAddedWords(prev => ({ ...prev, [word]: true }));
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
            <Text style={styles.summaryLabel}>Thời lượng</Text>
            <Text style={styles.summaryValue}>Luyện tập nghe</Text>
          </View>
        </View>
      </Card>

      {/* Expandable Review Section */}
      {wordParts && wordParts.length > 0 && (
        <Card variant="outlined" style={styles.collapsibleCard}>
          <TouchableOpacity 
            style={styles.collapsibleHeader} 
            onPress={() => setShowReview(!showReview)}
            activeOpacity={0.7}
          >
            <View style={styles.collapsibleTitleRow}>
              <Ionicons name="book-outline" size={20} color={Colors.primary} />
              <Text style={styles.collapsibleTitle}>Xem lại toàn bài</Text>
            </View>
            <Ionicons name={showReview ? "chevron-up" : "chevron-down"} size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
          
          {showReview && (
            <View style={styles.collapsibleContent}>
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
              
              <View style={styles.divider} />
              
              <Text style={styles.vocabSectionTitle}>Lưu từ vựng mới vào Flashcard</Text>
              {wordParts.filter(p => p.isBlank).map((part) => {
                const isAdded = addedWords[part.original];
                return (
                  <View key={part.id} style={styles.vocabRow}>
                    <View style={styles.vocabInfo}>
                      <Text style={styles.vocabKr}>{part.original}</Text>
                      <Text style={styles.vocabVi}>
                        {part.original.toLowerCase() === '린' ? 'Linh (tên riêng)' :
                         part.original.toLowerCase() === '공부하고' ? 'Đang học' :
                         part.original.toLowerCase() === '에서' ? 'Ở, tại, từ' :
                         part.original.toLowerCase() === '과일' ? 'Trái cây' :
                         part.original.toLowerCase() === '오천' ? '5000 (năm nghìn)' :
                         part.original.toLowerCase() === '싸요' ? 'Rẻ' : 'Từ vựng mới'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.btnAddVocab, isAdded && styles.btnAddVocabActive]}
                      onPress={() => !isAdded && handleAddWord(part.original)}
                      disabled={isAdded}
                    >
                      <Ionicons 
                        name={isAdded ? "checkmark" : "add"} 
                        size={16} 
                        color={isAdded ? Colors.white : Colors.primary} 
                      />
                      <Text style={[styles.btnAddVocabTxt, isAdded && styles.btnAddVocabTxtActive]}>
                        {isAdded ? "Đã lưu" : "Lưu thẻ"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      )}

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
  summaryCard: {
    padding: 0,
    marginBottom: 24,
    borderRadius: Radius.xl,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  collapsibleCard: {
    padding: 0,
    marginBottom: 24,
    overflow: 'hidden',
    borderRadius: Radius.xl,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  collapsibleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  collapsibleContent: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  reviewParagraph: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    lineHeight: 28,
    marginBottom: 16,
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
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  vocabSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  vocabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  vocabInfo: {
    flex: 1,
  },
  vocabKr: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  vocabVi: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  btnAddVocab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#FFF0F3',
  },
  btnAddVocabActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  btnAddVocabTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  btnAddVocabTxtActive: {
    color: Colors.white,
  },
  actions: {
    gap: 12,
  },
  btn: {
    borderRadius: Radius.xl,
  },
});
