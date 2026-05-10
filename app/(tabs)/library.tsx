import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Card, ProgressBar, Badge } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { flashcardRepo } from '@/db/repos/flashcardRepo';
import { useFlashcards } from '@/hooks/use-flashcards';
import { useCourses } from '@/hooks/use-courses';
import { MOCK_LISTENING_PARAGRAPHS } from '@/constants/mock-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabId = 'flashcards' | 'listening' | 'courses';

const TABS: ReadonlyArray<{ id: TabId; label: string; icon: string }> = [
  { id: 'flashcards', label: 'Từ vựng', icon: 'layers' },
  { id: 'listening', label: 'Luyện nghe', icon: 'headset' },
  { id: 'courses', label: 'Khóa học', icon: 'school' },
] as const;

import { useRouter, useLocalSearchParams } from 'expo-router';

export default function LibraryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: TabId }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabId>(params.tab || 'flashcards');
  
  // Update tab if params change
  React.useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  const { sets, loading: flashcardsLoading } = useFlashcards();
  const { courses, loading: coursesLoading } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const isLoading = flashcardsLoading || coursesLoading;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Học tập</Text>
        <TouchableOpacity
          style={[styles.searchBtn, showSearch && styles.searchBtnActive]}
          activeOpacity={0.7}
          onPress={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}
        >
           <Ionicons name={showSearch ? 'close-outline' : 'search-outline'} size={22} color={showSearch ? Colors.white : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'flashcards' ? 'Tìm bộ thẻ...' : activeTab === 'courses' ? 'Tìm khóa học...' : 'Tìm bài nghe...'}
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      )}

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'flashcards' && !searchQuery && (
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

          {activeTab === 'flashcards' && <FlashcardSetsList sets={sets} query={searchQuery} />}
          {activeTab === 'listening' && <ListeningList query={searchQuery} />}
          {activeTab === 'courses' && <CoursesList courses={courses} query={searchQuery} />}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

function FlashcardSetsList({ sets, query }: { sets: any[]; query: string }) {
  const router = useRouter();
  const [dueCount, setDueCount] = React.useState(0);

  React.useEffect(() => {
    flashcardRepo.getDueCards().then(cards => setDueCount(cards.length));
  }, []);

  const filtered = query
    ? sets.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase()))
    : sets;

  if (filtered.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyTitle}>Không tìm thấy bộ thẻ</Text>
        <Text style={styles.emptySubtitle}>Thử từ khóa khác nhé!</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {dueCount > 0 && !query && (
        <TouchableOpacity 
          style={styles.srsPrompt} 
          activeOpacity={0.9}
          onPress={() => router.push('/practice/srs-review')}
        >
          <View style={styles.srsLeft}>
            <View style={styles.srsIconBox}>
              <Ionicons name="calendar" size={24} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.srsTitle}>Ôn tập hàng ngày</Text>
              <Text style={styles.srsSubText}>Bạn có {dueCount} thẻ cần ôn tập</Text>
            </View>
          </View>
          <View style={styles.srsBadge}>
            <Text style={styles.srsBadgeText}>BẮT ĐẦU</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bộ thẻ đã lưu</Text>
        <TouchableOpacity><Text style={styles.seeAll}>Tất cả</Text></TouchableOpacity>
      </View>

      {filtered.map((set) => (
        <TouchableOpacity 
          key={set.id} 
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/practice/flashcards', params: { setId: set.id } })}
        >
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

function ListeningList({ query }: { query: string }) {
  const router = useRouter();
  const filtered = query
    ? MOCK_LISTENING_PARAGRAPHS.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
    : MOCK_LISTENING_PARAGRAPHS;

  if (filtered.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="headset-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyTitle}>Không tìm thấy bài nghe</Text>
        <Text style={styles.emptySubtitle}>Thử từ khóa khác nhé!</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
       <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bài luyện nghe</Text>
        <TouchableOpacity><Text style={styles.seeAll}>Lọc nhanh</Text></TouchableOpacity>
      </View>
      {filtered.map((p, index) => (
        <TouchableOpacity 
          key={p.id} 
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/practice/listening', params: { index: index.toString() } })}
        >
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

function CoursesList({ courses, query }: { courses: any[]; query: string }) {
  const router = useRouter();
  const filtered = query
    ? courses.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || (c.description || '').toLowerCase().includes(query.toLowerCase()))
    : courses;

  if (filtered.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="school-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyTitle}>Không tìm thấy khóa học</Text>
        <Text style={styles.emptySubtitle}>Thử từ khóa khác nhé!</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
       <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chương trình Yonsei</Text>
      </View>
      {filtered.map((course) => (
        <TouchableOpacity 
          key={course.id} 
          activeOpacity={0.8} 
          disabled={course.locked}
          onPress={() => router.push({ pathname: '/practice/lessons', params: { courseId: course.id } })}
        >
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
    paddingBottom: 40,
  },
  srsPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: Radius['2xl'],
    marginBottom: 20,
    ...Shadows.md,
  },
  srsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  srsIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  srsTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
  },
  srsSubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: Typography.weights.medium,
  },
  srsBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  srsBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.extrabold,
    color: '#8B5CF6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
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
  searchBtnActive: {
    backgroundColor: Colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginTop: 8,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
