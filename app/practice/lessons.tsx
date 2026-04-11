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
import { Card, Badge, ProgressBar } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { useLessons } from '@/hooks/use-lessons';

export default function LessonsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { lessons, loading } = useLessons(courseId || '1');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách bài học</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {lessons.length === 0 ? (
          <Text style={styles.emptyTxt}>Không có bài học nào trong khóa này.</Text>
        ) : (
          lessons.map((lesson, index) => (
            <TouchableOpacity 
              key={lesson.id} 
              activeOpacity={0.8}
              onPress={() => {
                if (lesson.type === 'vocabulary') {
                  router.push({ pathname: '/practice/flashcards', params: { setId: 'fs1' } });
                } else {
                  router.push({ pathname: '/practice/grammar', params: { lessonId: lesson.id } });
                }
              }}
            >
              <Card variant="elevated" style={styles.lessonCard}>
                <View style={styles.lessonMain}>
                   <View style={[styles.indexBox, lesson.completed && styles.completedBg]}>
                      {lesson.completed ? (
                        <Ionicons name="checkmark" size={16} color={Colors.white} />
                      ) : (
                        <Text style={styles.indexTxt}>{index + 1}</Text>
                      )}
                   </View>
                   <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <View style={styles.lessonMeta}>
                        <Text style={styles.metaTxt}>{lesson.duration}</Text>
                        <View style={styles.dot} />
                        <Badge 
                          label={lesson.type === 'vocabulary' ? 'Từ vựng' : lesson.type === 'grammar' ? 'Ngữ pháp' : 'Tổng hợp'} 
                          variant="outlined" 
                          style={styles.miniBadge}
                        />
                      </View>
                   </View>
                   <Ionicons name="play-circle-outline" size={32} color={Colors.primary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    gap: 16,
  },
  lessonCard: {
    padding: 16,
    borderRadius: Radius['2xl'],
  },
  lessonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  indexBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBg: {
    backgroundColor: Colors.success,
  },
  indexTxt: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  lessonInfo: {
    flex: 1,
    gap: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaTxt: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  miniBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  emptyTxt: {
    textAlign: 'center',
    marginTop: 100,
    color: Colors.textTertiary,
  }
});
