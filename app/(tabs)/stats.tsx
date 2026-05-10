import React from 'react';
import { ActivityIndicator, View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Card, ProgressBar } from '@/components/ui';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { MOCK_DAILY_STATS } from '@/constants/mock-data';
import { useStats } from '@/hooks/use-stats';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = React.useState('Tuần');
  const { stats, loading } = useStats();

  if (loading || !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê bài học</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Achievement Summary */}
        <View style={styles.summaryContainer}>
           <Image 
             source={require('@/assets/images/trophy.png')} 
             style={styles.trophyImg} 
             contentFit="contain"
             transition={400}
           />
           <View style={styles.statsHighlights}>
              <View style={styles.highlightItem}>
                 <Text style={styles.highlightVal}>{stats.streak}</Text>
                 <Text style={styles.highlightLabel}>Ngày liên tiếp</Text>
              </View>
              <View style={styles.highlightDivider} />
              <View style={styles.highlightItem}>
                 <Text style={styles.highlightVal}>{stats.xp.toLocaleString()}</Text>
                 <Text style={styles.highlightLabel}>Tổng kinh nghiệm</Text>
              </View>
           </View>
        </View>

        {/* Learning Activity */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Thời lượng học</Text>
              <View style={styles.segmentControl}>
                 {['Ngày', 'Tuần', 'Tháng'].map((p) => (
                   <TouchableOpacity 
                     key={p} 
                     onPress={() => setPeriod(p)}
                     style={[styles.segmentItem, period === p && styles.segmentItemActive]}
                   >
                      <Text style={[styles.segmentText, period === p && styles.segmentTextActive]}>{p}</Text>
                   </TouchableOpacity>
                 ))}
              </View>
           </View>

           <Card variant="elevated" style={styles.chartCard}>
              <View style={styles.chartHeaderInfo}>
                 <Text style={styles.chartTotal}>
                   {period === 'Tuần' ? '420 phút' : period === 'Ngày' ? '45 phút' : '1,250 phút'}
                 </Text>
                 <Text style={styles.chartPeriod}>
                   {period === 'Tuần' 
                     ? `Tuần này (${new Date().getDate() - new Date().getDay() + 1}/${new Date().getMonth() + 1} - ${new Date().getDate() - new Date().getDay() + 7}/${new Date().getMonth() + 1})`
                     : period === 'Ngày' 
                     ? `Hôm nay (${new Date().getDate()}/${new Date().getMonth() + 1})`
                     : `Tháng này (Tháng ${new Date().getMonth() + 1})`}
                 </Text>
              </View>
              <View style={styles.barsContainer}>
                 {(period === 'Tuần' ? MOCK_DAILY_STATS.weeklyData : period === 'Ngày' ? MOCK_DAILY_STATS.weeklyData.slice(0, 1) : [
                   { day: 'T1', minutes: 120 }, { day: 'T2', minutes: 150 }, { day: 'T3', minutes: 200 }, { day: 'T4', minutes: 180 }
                 ]).map((d, i, arr) => {
                   const isToday = i === arr.length - 1;
                   const height = 30 + (d.minutes / 250) * 100;
                   return (
                     <View key={d.day} style={styles.barCol}>
                        <View style={[styles.bar, { height: `${Math.min(height, 100)}%` }, isToday && styles.barActive]} />
                        <Text style={[styles.barDay, isToday && styles.barDayActive]}>{d.day}</Text>
                     </View>
                   );
                 })}
              </View>
           </Card>
        </View>

        {/* Skills Progress */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Kỹ năng ngôn ngữ</Text>
           <View style={styles.progressGrid}>
              {[
                { label: 'Từ vựng', val: stats.vocabularyProgress, icon: 'book', color: Colors.primary },
                { label: 'Ngữ pháp', val: stats.grammarProgress, icon: 'library', color: '#2196F3' },
                { label: 'Phát âm', val: (stats.vocabularyProgress + stats.grammarProgress) / 2 || 0, icon: 'mic', color: '#4CAF50' },
              ].map((skill) => (
                <View key={skill.label} style={styles.skillCard}>
                   <View style={[styles.skillIconBox, { backgroundColor: `${skill.color}15` }]}>
                      <Ionicons name={`${skill.icon}-outline` as any} size={22} color={skill.color} />
                   </View>
                   <View style={styles.skillInfo}>
                      <View style={styles.skillRow}>
                         <Text style={styles.skillLabel}>{skill.label}</Text>
                         <Text style={styles.skillVal}>{Math.round(skill.val * 100)}%</Text>
                      </View>
                      <ProgressBar progress={skill.val} height={6} color={skill.color} style={styles.skillBar} />
                   </View>
                </View>
              ))}
           </View>
        </View>

        {/* Achievements Preview */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Thành tựu mới</Text>
              <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
           </View>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsRow}>
              {[
                { label: 'Siêu sao', icon: 'star', color: Colors.primary, bg: '#FFF0F3', req: 500 },
                { label: 'Nhiệt huyết', icon: 'flame', color: '#FFA000', bg: '#FFF8E1', req: 100 },
                { label: 'Tri thức', icon: 'book', color: '#4CAF50', bg: '#E8F5E9', req: 50 },
                { label: 'Phản xạ', icon: 'flash', color: '#2196F3', bg: '#E3F2FD', req: 10 },
              ].filter(a => stats.xp >= a.req).map((item) => (
                <TouchableOpacity key={item.label} style={styles.achievementBadge} activeOpacity={0.8}>
                   <View style={[styles.badgeIconBox, { backgroundColor: item.bg }]}>
                      <Ionicons name={`${item.icon}-outline` as any} size={28} color={item.color} />
                   </View>
                   <Text style={styles.badgeLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  headerBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  summaryContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: 15,
  },
  trophyImg: {
    width: 200,
    height: 200,
    marginBottom: 25,
  },
  statsHighlights: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 24,
    paddingHorizontal: 28,
    borderRadius: Radius['3xl'],
    ...Shadows.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    width: '100%',
  },
  highlightDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
  },
  highlightVal: {
    fontSize: 24,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  highlightLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 6,
    fontWeight: Typography.weights.bold,
  },
  section: {
    marginTop: 40,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: Radius.xl,
  },
  segmentItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.lg,
  },
  segmentItemActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
  },
  segmentTextActive: {
    color: Colors.primary,
  },
  chartCard: {
    padding: 24,
    borderRadius: Radius['3xl'],
  },
  chartHeaderInfo: {
    marginBottom: 25,
  },
  chartTotal: {
    fontSize: 26,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  chartPeriod: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 16,
    backgroundColor: '#FCE7F3',
    borderRadius: 8,
    minHeight: 10,
  },
  barActive: {
    backgroundColor: Colors.primary,
  },
  barDay: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    marginTop: 12,
  },
  barDayActive: {
    color: Colors.primary,
  },
  progressGrid: {
    gap: 16,
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Shadows.sm,
    gap: 16,
  },
  skillIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillInfo: {
    flex: 1,
    gap: 10,
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  skillLabel: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  skillVal: {
    fontSize: 12,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textTertiary,
  },
  skillBar: {
    borderRadius: Radius.full,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  achievementsRow: {
    gap: 20,
    paddingRight: 20,
  },
  achievementBadge: {
    alignItems: 'center',
    gap: 10,
  },
  badgeIconBox: {
    width: 72,
    height: 72,
    borderRadius: Radius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
});
