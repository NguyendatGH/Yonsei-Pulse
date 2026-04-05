import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Badge } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { MOCK_LESSON_SETUP } from '@/constants/mock-data';

export default function LessonSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [difficulty, setDifficulty] = useState('easy');
  const [activeMode, setActiveMode] = useState('listening');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thiết lập bài học</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mức độ khó</Text>
          <View style={styles.difficultyGrid}>
            {MOCK_LESSON_SETUP.difficultyLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                onPress={() => setDifficulty(level.id)}
                activeOpacity={0.7}
                style={styles.difficultyCardWrapper}
              >
                <Card
                  variant="elevated"
                  style={[
                    styles.difficultyCard,
                    difficulty === level.id ? styles.cardActive : null,
                  ]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: difficulty === level.id ? 'rgba(255,255,255,0.2)' : `${Colors.primary}10` }]}>
                    <Ionicons 
                      name={level.icon as any} 
                      size={24} 
                      color={difficulty === level.id ? Colors.white : Colors.primary} 
                    />
                  </View>
                  <Text style={[styles.difficultyLabel, difficulty === level.id && styles.textActive]}>{level.label}</Text>
                  <Text style={[styles.difficultyDesc, difficulty === level.id && styles.textDescActive]}>{level.description}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chế độ luyện tập</Text>
          <View style={styles.modesGrid}>
            {MOCK_LESSON_SETUP.practiceMode.map((mode) => (
              <TouchableOpacity 
                key={mode.id} 
                activeOpacity={0.7}
                onPress={() => setActiveMode(mode.id)}
                style={styles.modeCardWrapper}
              >
                <Card 
                  variant="elevated" 
                  style={[styles.modeCard, activeMode === mode.id && styles.cardActive]}
                >
                  <Ionicons 
                    name={mode.icon as any} 
                    size={28} 
                    color={activeMode === mode.id ? Colors.white : Colors.primary} 
                  />
                  <Text style={[styles.modeLabel, activeMode === mode.id && styles.textActive]}>{mode.label}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại từ vựng</Text>
          <View style={styles.typesRow}>
            {MOCK_LESSON_SETUP.wordTypes.map((type) => (
               <TouchableOpacity key={type.id} style={styles.typeChip}>
                  <Text style={styles.typeText}>{type.label}</Text>
                  <Ionicons name="checkmark" size={16} color={Colors.primary} />
               </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Bắt đầu ngay"
          onPress={() => router.push('/practice/listening')}
          fullWidth
          size="lg"
          style={styles.startButton}
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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  difficultyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyCardWrapper: {
    flex: 1,
  },
  difficultyCard: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius['2xl'],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyIcon: {
    fontSize: 24,
  },
  difficultyLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  difficultyDesc: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  textActive: {
    color: Colors.white,
  },
  textDescActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  modesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCardWrapper: {
    flex: 1,
  },
  modeCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius['2xl'],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.xl,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeText: {
    fontSize: 13,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  startButton: {
    marginTop: Spacing['2xl'],
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
  },
});
