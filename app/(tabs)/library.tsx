import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Card, ProgressBar, Badge } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { MOCK_FLASHCARD_SETS, MOCK_COURSES, MOCK_LISTENING_PARAGRAPHS } from '@/constants/mock-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabId = 'flashcards' | 'listening' | 'courses';

const TABS: ReadonlyArray<{ id: TabId; label: string; icon: string }> = [
  { id: 'flashcards', label: 'Từ vựng', icon: 'layers' },
  { id: 'listening', label: 'Luyện nghe', icon: 'headset' },
  { id: 'courses', label: 'Khóa học', icon: 'school' },
] as const;

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabId>('flashcards');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Học tập</Text>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
           <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              {isActive ? (
                <LinearGradient
                  colors={[Colors.primary, '#F28C9D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGrad}
                >
                  <Ionicons name={`${tab.icon}-outline` as any} size={18} color={Colors.white} />
                  <Text style={styles.activeTabText}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Ionicons name={`${tab.icon}-outline` as any} size={18} color={Colors.textTertiary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'flashcards' && (
          <View style={styles.heroSection}>
             <Image 
               source={require('@/assets/images/flashcards.png')} 
               style={styles.heroImg} 
               contentFit="cover"
               transition={400}
             />
             <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>Thẻ từ vựng thông minh</Text>
                <Text style={styles.heroSubtitle}>Ghi nhớ từ vựng hiệu quả qua hình ảnh và âm thanh</Text>
             </LinearGradient>
          </View>
        )}

        {activeTab === 'flashcards' && <FlashcardSetsList />}
        {activeTab === 'listening' && <ListeningList />}
        {activeTab === 'courses' && <CoursesList />}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function FlashcardSetsList() {
  return (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bộ thẻ đã lưu</Text>
        <TouchableOpacity><Text style={styles.seeAll}>Tất cả</Text></TouchableOpacity>
      </View>

      {MOCK_FLASHCARD_SETS.map((set) => (
        <TouchableOpacity key={set.id} activeOpacity={0.8}>
          <Card variant="elevated" style={styles.itemCard}>
            <View style={styles.cardMain}>
              <View style={[styles.iconBox, { backgroundColor: `${set.color}12` }]}>
                <Text style={styles.emojiIcon}>{set.emoji}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{set.title}</Text>
                <View style={styles.badgeRow}>
                   <Badge label={set.category} variant="default" style={styles.miniBadge} />
                   <Text style={styles.metaText}>{set.totalCards} thẻ</Text>
                </View>
                <View style={styles.progLine}>
                   <View style={styles.progBg}>
                      <View 
                        style={[
                          styles.progFill, 
                          { width: `${(set.mastered / set.totalCards) * 100}%`, backgroundColor: set.color }
                        ]} 
                      />
                   </View>
                   <Text style={styles.progPerc}>{Math.round((set.mastered / set.totalCards) * 100)}%</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color={Colors.textTertiary} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ListeningList() {
  return (
    <View style={styles.listContainer}>
       <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bài luyện nghe</Text>
        <TouchableOpacity><Text style={styles.seeAll}>Lọc nhanh</Text></TouchableOpacity>
      </View>
      {MOCK_LISTENING_PARAGRAPHS.map((p) => (
        <TouchableOpacity key={p.id} activeOpacity={0.8}>
           <Card variant="elevated" style={styles.itemCard}>
              <View style={styles.cardMain}>
                 <View style={styles.playIconContainer}>
                    <Ionicons 
                      name={p.completed ? "checkmark-circle" : "play-circle-outline"} 
                      size={36} 
                      color={p.completed ? Colors.success : Colors.primary} 
                    />
                 </View>
                 <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{p.title}</Text>
                    <View style={styles.metaRow}>
                       <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                       <Text style={styles.metaText}>{p.duration}</Text>
                       <View style={styles.dot} />
                       <Text style={[styles.diffText, { color: p.difficulty === 'hard' ? Colors.error : p.color || Colors.primary }]}>
                         {p.difficulty === 'easy' ? 'Cơ bản' : 'Nâng cao'}
                       </Text>
                    </View>
                 </View>
                 <Ionicons name="chevron-forward-outline" size={18} color={Colors.textTertiary} />
              </View>
           </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CoursesList() {
  return (
    <View style={styles.listContainer}>
       <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chương trình Yonsei</Text>
      </View>
      {MOCK_COURSES.map((course) => (
        <TouchableOpacity key={course.id} activeOpacity={0.8} disabled={course.locked}>
           <Card variant="elevated" style={[styles.itemCard, course.locked && styles.lockedCard]}>
              <View style={styles.cardMain}>
                 <View style={[styles.iconBox, { backgroundColor: course.locked ? '#F3F4F6' : `${course.color}12` }]}>
                    <Ionicons 
                      name={course.locked ? "lock-closed-outline" : "school-outline"} 
                      size={24} 
                      color={course.locked ? Colors.textTertiary : course.color} 
                    />
                 </View>
                 <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, course.locked && styles.lockedText]}>{course.title}</Text>
                    <Text style={styles.itemDesc}>{course.description}</Text>
                    {!course.locked && (
                       <ProgressBar progress={course.progress} height={5} color={course.color} style={styles.courseProg} />
                    )}
                 </View>
                 {!course.locked && <Text style={styles.progPerc}>{Math.round(course.progress * 100)}%</Text>}
              </View>
           </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  searchBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    backgroundColor: '#F3F4F6',
    borderRadius: Radius['2xl'],
    padding: 4,
    height: 56,
  },
  tabItem: {
    flex: 1,
  },
  activeTabGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xl,
    gap: 8,
    ...Shadows.md,
  },
  activeTabText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: Typography.weights.extrabold,
  },
  inactiveTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    marginHorizontal: Spacing.xl,
    marginTop: 25,
    height: 180,
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: Typography.weights.extrabold,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: Typography.weights.medium,
  },
  listContainer: {
    marginTop: 35,
    paddingHorizontal: Spacing.xl,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  itemCard: {
    padding: 16,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiIcon: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  miniBadge: {
    height: 20,
    paddingHorizontal: 8,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
  progLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  progBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progFill: {
    height: '100%',
    borderRadius: 3,
  },
  progPerc: {
    fontSize: 11,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },
  playIconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
  },
  diffText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  itemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  courseProg: {
    marginTop: 12,
  },
  lockedCard: {
    opacity: 0.6,
  },
  lockedText: {
    color: Colors.textTertiary,
  },
});
