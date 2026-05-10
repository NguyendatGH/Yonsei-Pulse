import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ProgressBar } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { examRepo, Exam, Question } from '@/db/repos/examRepo';
import { ActivityIndicator } from 'react-native';

export default function ExamScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); 

  useEffect(() => {
    examRepo.generateExam()
      .then(setExam)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!exam) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [exam]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !exam) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const totalQ = exam.questions.length;
  const question = exam.questions[currentQ];
  const progress = (currentQ + 1) / totalQ;

  const handleFinish = (currentAnswers: Record<number, any>) => {
    if (!exam) return;
    let correct = 0;
    exam.questions.forEach((q, index) => {
      const userAnswer = currentAnswers[index];
      if (q.type === 'multiple_choice') {
        if (userAnswer === q.correctAnswer) correct++;
      } else if (q.type === 'fill_blank') {
        if (typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === String(q.correctAnswer).toLowerCase()) {
          correct++;
        }
      }
    });

    const score = Math.round((correct / totalQ) * 100);
    const timeTakenSec = (30 * 60) - timeLeft;
    const timeTakenStr = formatTime(timeTakenSec);

    router.push({
      pathname: '/practice/exam-result',
      params: {
        score,
        totalQuestions: totalQ,
        correctAnswers: correct,
        wrongAnswers: totalQ - correct,
        timeTaken: timeTakenStr,
        passed: score >= exam.passingScore ? 'true' : 'false',
      }
    });
  };

  const handleNext = () => {
    const newAnswers = {
      ...answers,
      [currentQ]: question.type === 'multiple_choice' ? selectedOption : textAnswer
    };
    setAnswers(newAnswers);

    if (currentQ < totalQ - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(answers[currentQ + 1] ?? null);
      setTextAnswer(answers[currentQ + 1] ?? '');
    } else {
      handleFinish(newAnswers);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.timerBox}>
          <Ionicons name="time" size={18} color={timeLeft < 60 ? Colors.error : Colors.primary} />
          <Text style={[styles.timerText, { color: timeLeft < 60 ? Colors.error : Colors.primary }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleFinish(answers)} style={styles.finishBtn}>
          <Text style={styles.finishBtnText}>Nộp bài</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar progress={progress} height={6} color={Colors.primary} style={styles.progressBar} />
        <Text style={styles.progressText}>Câu hỏi {currentQ + 1} / {totalQ}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
           <Text style={styles.questionType}>
              {question.type === 'multiple_choice' ? 'Câu hỏi lựa chọn' : 'Điền vào chỗ trống'}
           </Text>
           <Text style={styles.questionText}>{question.question}</Text>
        </View>

        <View style={styles.optionsGrid}>
           {question.type === 'multiple_choice' ? (
             question.options?.map((option, index) => (
               <TouchableOpacity 
                 key={index} 
                 activeOpacity={0.8} 
                 style={[styles.optionItem, selectedOption === index && styles.optionItemActive]}
                 onPress={() => setSelectedOption(index)}
               >
                 <View style={[styles.optionIndex, selectedOption === index && styles.optionIndexActive]}>
                    <Text style={[styles.optionLetter, selectedOption === index && styles.optionLetterActive]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                 </View>
                 <Text style={[styles.optionText, selectedOption === index && styles.optionTextActive]}>{option}</Text>
                 {selectedOption === index && <Ionicons name="checkmark-circle" size={20} color={Colors.white} />}
               </TouchableOpacity>
             ))
           ) : (
             <TextInput
               style={styles.answerInput}
               placeholder="Nhập câu trả lời của bạn..."
               placeholderTextColor={Colors.textTertiary}
               multiline
               value={textAnswer}
               onChangeText={setTextAnswer}
             />
           )}
        </View>

        <View style={styles.supportRow}>
           <TouchableOpacity style={styles.supportBtn}>
              <Ionicons name="language" size={20} color={Colors.primary} />
              <Text style={styles.supportText}>Dịch</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.supportBtn}>
              <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
              <Text style={styles.supportText}>Gợi ý</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.supportBtn}>
              <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
              <Text style={styles.supportText}>Thảo luận</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
         <Button
            title={currentQ === totalQ - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
            onPress={handleNext}
            fullWidth
            size="lg"
            style={styles.nextBtn}
          />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  timerText: {
    fontSize: 14,
    fontWeight: Typography.weights.extrabold,
    color: Colors.error,
  },
  finishBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
  },
  progressSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    gap: 8,
  },
  progressBar: {
    backgroundColor: '#F3F4F6',
  },
  progressText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 20,
  },
  questionCard: {
    padding: Spacing.xl,
    backgroundColor: '#F9FAFB',
    borderRadius: Radius['3xl'],
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionType: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  optionsGrid: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Radius['2xl'],
    borderWidth: 2,
    borderColor: '#F3F4F6',
    gap: 16,
  },
  optionItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  optionIndex: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textSecondary,
  },
  optionLetterActive: {
    color: Colors.white,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  optionTextActive: {
    color: Colors.white,
  },
  answerInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: Spacing.lg,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  supportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  supportText: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 10,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
  },
});
