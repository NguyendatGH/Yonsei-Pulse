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
import { courseRepo, Course } from '@/db/repos/courseRepo';
import { LinearGradient } from 'expo-linear-gradient';

export default function LessonsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { lessons, loading: lessonsLoading } = useLessons(courseId || '1');
  const [course, setCourse] = React.useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = React.useState(true);

  React.useEffect(() => {
    if (courseId) {
      setLoadingCourse(true);
      courseRepo.getCourseById(courseId)
        .then(setCourse)
        .finally(() => setLoadingCourse(false));
    }
  }, [courseId]);

  if (lessonsLoading || loadingCourse) {
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
        <Text style={styles.headerTitle}>Chi tiết khóa học</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {course && (
          <Card variant="elevated" style={styles.courseHeaderCard}>
            <LinearGradient
              colors={[`${course.color}EE`, course.color]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.courseGrad}
            >
              <View style={styles.courseHeaderTop}>
                <View style={styles.courseIconBox}>
                  <Ionicons name="school" size={32} color={course.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Badge label={course.level} variant="default" style={styles.levelBadge} />
                  <Text style={styles.courseTitle}>{course.title}</Text>
                </View>
              </View>
              <Text style={styles.courseDesc}>{course.description}</Text>
              
              <View style={styles.courseStatsRow}>
                <View style={styles.courseStat}>
                  <Text style={styles.courseStatVal}>{course.totalLessons}</Text>
                  <Text style={styles.courseStatLab}>Bài học</Text>
                </View>
                <View style={styles.courseStatDivider} />
                <View style={styles.courseStat}>
                  <Text style={styles.courseStatVal}>{Math.round(course.progress * 100)}%</Text>
                  <Text style={styles.courseStatLab}>Hoàn thành</Text>
                </View>
              </View>
              
              <ProgressBar 
                progress={course.progress} 
                height={8} 
                color={Colors.white} 
                backgroundColor="rgba(255,255,255,0.2)"
                style={{ marginTop: 20 }}
              />
            </LinearGradient>
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.lessonsTitle}>Lộ trình bài học</Text>
          <Text style={styles.lessonCount}>{lessons.length} bài</Text>
        </View>
        {lessons.length === 0 ? (
          <Text style={styles.emptyTxt}>Không có bài học nào trong khóa này.</Text>
        ) : (
          lessons.map((lesson, index) => (
            <TouchableOpacity 
              key={lesson.id} 
              activeOpacity={0.8}
              onPress={() => {
                if (lesson.type === 'vocabulary') {
                  router.push({ pathname: '/practice/flashcards', params: { setId: 'fs1', lessonId: lesson.id } });
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
    paddingBottom: 40,
    gap: 16,
  },
  courseHeaderCard: {
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    marginBottom: 8,
    ...Shadows.lg,
  },
  courseGrad: {
    padding: 24,
  },
  courseHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  courseIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'transparent',
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
  },
  courseDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    fontWeight: Typography.weights.medium,
  },
  courseStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 24,
  },
  courseStat: {
    alignItems: 'flex-start',
  },
  courseStatVal: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
  },
  courseStatLab: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: Typography.weights.bold,
  },
  courseStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  lessonCount: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.bold,
  },
  lessonCard: {
    padding: 16,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
