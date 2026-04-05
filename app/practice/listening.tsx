import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, ProgressBar } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { MOCK_LISTENING_PARAGRAPHS } from '@/constants/mock-data';

export default function ListeningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIdx, setCurrentIdx] = useState(0);
  const data = MOCK_LISTENING_PARAGRAPHS[currentIdx];

  const renderContent = () => {
    const parts = data.korean.split('___');
    return (
      <View style={styles.koreanContainer}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <Text style={styles.koreanText}>{part}</Text>
            {index < parts.length - 1 && (
              <TextInput
                style={styles.blankInput}
                placeholder="..."
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Luyện nghe</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressHeader}>
         <View style={styles.progressRowTop}>
            <Text style={styles.progressText}>Câu {currentIdx + 1}/{MOCK_LISTENING_PARAGRAPHS.length}</Text>
            <ProgressBar progress={(currentIdx + 1) / MOCK_LISTENING_PARAGRAPHS.length} height={8} color={Colors.primary} style={styles.topProgressBar} />
         </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.audioCard}>
          <View style={styles.audioRow}>
             <TouchableOpacity style={styles.mainPlayBtn}>
                <Ionicons name="pause" size={32} color={Colors.white} />
             </TouchableOpacity>
             <View style={styles.audioInfoCol}>
                <Text style={styles.audioTitle}>{data.title}</Text>
                <View style={styles.audioProgressRow}>
                   <View style={styles.audioBarBg}>
                      <View style={[styles.audioBarFill, { width: '45%' }]} />
                   </View>
                   <Text style={styles.audioTime}>01:20 / {data.duration}</Text>
                </View>
             </View>
          </View>
        </Card>

        <View style={styles.contentSection}>
           <View style={styles.contentHeader}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
              <Text style={styles.contentLabel}>Nội dung đoạn văn</Text>
           </View>
           
           <Card variant="elevated" style={styles.koreanCard}>
              {renderContent()}
           </Card>

           <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Bản dịch tiếng Việt</Text>
              <Text style={styles.hintText}>{data.vietnamese}</Text>
           </View>
        </View>

        <Button
          title="Kiểm tra kết quả"
          onPress={() => router.push('/practice/lesson-complete')}
          fullWidth
          size="lg"
          style={styles.submitBtn}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressHeader: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
  },
  progressRowTop: {
    gap: 8,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  topProgressBar: {
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  audioCard: {
    padding: Spacing.md,
    borderRadius: Radius['2xl'],
    marginTop: Spacing.md,
    backgroundColor: '#FFF0F3',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  mainPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  audioInfoCol: {
    flex: 1,
    gap: 10,
  },
  audioTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  audioProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  audioBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  audioTime: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.bold,
    minWidth: 70,
  },
  contentSection: {
    marginTop: Spacing['2xl'],
    gap: Spacing.md,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  koreanCard: {
    padding: Spacing.lg,
    borderRadius: Radius['2xl'],
    minHeight: 150,
  },
  koreanContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 4,
    rowGap: 12,
  },
  koreanText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
    lineHeight: 32,
  },
  blankInput: {
    minWidth: 70,
    height: 32,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 18,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    paddingBottom: 2,
  },
  hintBox: {
    marginTop: Spacing.sm,
    backgroundColor: '#F9FAFB',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  hintTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  hintText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: Typography.weights.medium,
  },
  submitBtn: {
    marginTop: Spacing['2xl'],
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
  },
});
