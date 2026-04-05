import React from 'react';
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
import { useRouter } from 'expo-router';
import { Card, ProgressBar, Badge } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import {
  MOCK_USER,
  MOCK_DAILY_STATS,
  MOCK_QUICK_ACTIONS,
  MOCK_COURSES,
  MOCK_CULTURE_TIP,
} from '@/constants/mock-data';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
      >
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
           <Image 
             source={require('@/assets/images/greeting.png')} 
             style={styles.bannerImage} 
             contentFit="cover"
             transition={400}
           />
           <LinearGradient 
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']} 
              style={styles.bannerOverlay}
           >
              <View style={styles.headerTop}>
                 <View>
                    <Text style={styles.bannerSub}>CHÀO BUỔI SÁNG</Text>
                    <Text style={styles.bannerMain}>An-nyeong, {MOCK_USER.name}! ✨</Text>
                 </View>
                 <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
                    <Image 
                      source={require('@/assets/images/user_avatar.png')} 
                      style={styles.avatarImage} 
                      contentFit="cover"
                    />
                 </TouchableOpacity>
              </View>

              <View style={styles.dailyQuoteBox}>
                 <Text style={styles.quoteText}>"Hành trình vạn dặm bắt đầu từ một bước chân."</Text>
              </View>
           </LinearGradient>
        </View>

        {/* Daily Stats Summary */}
        <View style={styles.statsOverviewRow}>
           <Card variant="elevated" style={styles.statMiniCard}>
              <Ionicons name="flame" size={20} color="#FF96BB" />
              <Text style={styles.statMiniVal}>{MOCK_USER.streak}</Text>
              <Text style={styles.statMiniLabel}>Ngày chuỗi</Text>
           </Card>
           <Card variant="elevated" style={styles.statMiniCard}>
              <Ionicons name="flash" size={20} color="#FBBF24" />
              <Text style={styles.statMiniVal}>{MOCK_USER.xp}</Text>
              <Text style={styles.statMiniLabel}>Kinh nghiệm</Text>
           </Card>
           <Card variant="elevated" style={styles.statMiniCard}>
              <Ionicons name="checkmark-circle" size={20} color="#34D399" />
              <Text style={styles.statMiniVal}>{MOCK_USER.completedLessons}</Text>
              <Text style={styles.statMiniLabel}>Bài đã học</Text>
           </Card>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Luyện tập nhanh</Text>
           </View>
           <View style={styles.quickActionGrid}>
              {MOCK_QUICK_ACTIONS.filter(a => a.id !== 'custom').map((action) => (
                <TouchableOpacity 
                   key={action.id} 
                   style={styles.actionItem} 
                   activeOpacity={0.8}
                   onPress={() => router.push(action.route as any)}
                >
                   <LinearGradient
                      colors={[`${action.color}22`, `${action.color}44`]}
                      style={styles.actionIconBox}
                   >
                      <Ionicons name={`${action.icon}-outline` as any} size={32} color={action.color} />
                   </LinearGradient>
                   <Text style={styles.actionLabel}>{action.title}</Text>
                </TouchableOpacity>
              ))}
           </View>
        </View>

        {/* Custom Content CTA */}
        <View style={styles.section}>
            <TouchableOpacity 
               style={styles.customCTACard} 
               activeOpacity={0.9}
               onPress={() => router.push('/practice/custom-dictation')}
            >
               <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.customCTAGradient}
               >
                  <View style={styles.customCTALeft}>
                     <View style={styles.customCTAIconBox}>
                        <Ionicons name="headset" size={26} color="#8B5CF6" />
                     </View>
                     <View style={{ flex: 1 }}>
                        <Text style={styles.customCTATitle}>Luyện nghe & Dictation</Text>
                        <Text style={styles.customCTASub}>Học qua điền từ vựng khi nghe văn bản</Text>
                     </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={Colors.white} />
               </LinearGradient>
            </TouchableOpacity>
        </View>

        {/* Current Lesson Pathway */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đang học tiếp</Text>
              <TouchableOpacity><Text style={styles.seeAll}>Lộ trình</Text></TouchableOpacity>
           </View>
           
           <TouchableOpacity style={styles.activeCourseCard} activeOpacity={0.9}>
              <LinearGradient 
                colors={[Colors.primary, '#F28C9D']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={styles.activeCourseGrad}
              >
                 <View style={styles.activeCourseTop}>
                    <View style={styles.courseIconCircle}>
                       <Ionicons name="school" size={26} color={Colors.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                       <Text style={styles.activeCourseTitle}>{MOCK_COURSES[1].title}</Text>
                       <Text style={styles.activeCourseSub}>Chủ đề: {MOCK_COURSES[1].description}</Text>
                    </View>
                 </View>
                 <View style={styles.activeCourseProgress}>
                    <View style={styles.progHeader}>
                       <Text style={styles.progText}>Tiến trình khóa học</Text>
                       <Text style={styles.progPerc}>{Math.round(MOCK_COURSES[1].progress * 100)}%</Text>
                    </View>
                    <ProgressBar 
                       progress={MOCK_COURSES[1].progress} 
                       height={8} 
                       color={Colors.white} 
                       backgroundColor="rgba(255,255,255,0.2)" 
                    />
                 </View>
              </LinearGradient>
           </TouchableOpacity>
        </View>

        {/* Tip of the day */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
           </View>
           <Card style={styles.tipCard} variant="elevated">
              <View style={styles.tipContent}>
                 <View style={styles.tipIconBox}>
                    <Ionicons name="bulb" size={24} color={Colors.primary} />
                 </View>
                 <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>{MOCK_CULTURE_TIP.title}</Text>
                    <Text style={styles.tipDesc} numberOfLines={2}>
                       {MOCK_CULTURE_TIP.description} Khám phá những điều thú vị về văn hóa Hàn Quốc ngay bây giờ!
                    </Text>
                 </View>
              </View>
           </Card>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    height: 220,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerSub: {
    fontSize: 11,
    fontWeight: Typography.weights.extrabold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
  bannerMain: {
    fontSize: 24,
    fontWeight: Typography.weights.extrabold,
    color: Colors.white,
    marginTop: 4,
  },
  avatarBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  dailyQuoteBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.xl,
    alignSelf: 'flex-start',
  },
  quoteText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: Typography.weights.medium,
    fontStyle: 'italic',
  },
  statsOverviewRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: 25,
    gap: 12,
  },
  statMiniCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: Radius['2xl'],
    backgroundColor: Colors.white,
    gap: 4,
  },
  statMiniVal: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  statMiniLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 35,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - 36) / 4,
    alignItems: 'center',
    gap: 8,
  },
  actionIconBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  activeCourseCard: {
    width: '100%',
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    ...Shadows.md,
  },
  activeCourseGrad: {
    padding: 24,
  },
  activeCourseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  courseIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCourseTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
  },
  activeCourseSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: Typography.weights.medium,
  },
  activeCourseProgress: {
    marginTop: 24,
  },
  progHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  progPerc: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: Typography.weights.extrabold,
  },
  tipCard: {
    padding: 16,
    borderRadius: Radius['2xl'],
    borderColor: '#F1F5F9',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tipIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  customCTACard: {
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    ...Shadows.md,
  },
  customCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    gap: 16,
  },
  customCTALeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  customCTAIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCTATitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
  },
  customCTASub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: Typography.weights.medium,
  },
});
