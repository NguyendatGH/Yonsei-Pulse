import React from 'react';
import { ActivityIndicator, View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Card, ProgressBar } from '@/components/ui';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { MOCK_DAILY_STATS } from '@/constants/mock-data';
import { useStats } from '@/hooks/use-stats';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return "0 phút";
  const roundedMin = Math.round(minutes);
  const hrs = Math.floor(roundedMin / 60);
  const mins = roundedMin % 60;
  
  if (hrs > 0) {
    if (mins > 0) {
      return `${hrs} giờ ${mins} phút`;
    }
    return `${hrs} giờ`;
  }
  return `${mins} phút`;
};

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = React.useState('Tuần');
  const { stats, loading, refreshStats } = useStats();

  useFocusEffect(
    React.useCallback(() => {
      refreshStats();
    }, [])
  );

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

        {/* Curved Wave Chart */}
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

           <Card variant="elevated" style={styles.chartCardWave}>
              <View style={styles.chartHeaderInfoWave}>
                  <Text style={styles.chartTotalWave}>
                    {period === 'Tuần' ? formatDuration(stats.totalMinutes) : period === 'Ngày' ? formatDuration(stats.weeklyActivity[stats.weeklyActivity.length - 1]?.minutes || 0) : formatDuration(stats.totalMinutes * 4)}
                  </Text>
                 <Text style={styles.chartPeriodWave}>
                   {period === 'Tuần' 
                     ? `Tuần này (${new Date().getDate() - new Date().getDay() + 1}/${new Date().getMonth() + 1} - ${new Date().getDate() - new Date().getDay() + 7}/${new Date().getMonth() + 1})`
                     : period === 'Ngày' 
                     ? `Hôm nay (${new Date().getDate()}/${new Date().getMonth() + 1})`
                     : `Tháng này (Tháng ${new Date().getMonth() + 1})`}
                 </Text>
              </View>

              <View style={styles.waveChartContainer}>
                 <Svg height="130" width={SCREEN_WIDTH - 64} style={styles.waveSvg}>
                   <Defs>
                     <SvgLinearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                       <Stop offset="0" stopColor="#38BDF8" stopOpacity="0.4" />
                       <Stop offset="1" stopColor="#38BDF8" stopOpacity="0.0" />
                     </SvgLinearGradient>
                   </Defs>
                   
                   <Path 
                     d={(() => {
                       const maxMinutes = Math.max(...stats.weeklyActivity.map(d => d.minutes), 10);
                       const points = stats.weeklyActivity.map((d, index) => {
                         const x = (index * (SCREEN_WIDTH - 64)) / 6;
                         const y = 90 - (d.minutes / maxMinutes) * 60;
                         return { x, y };
                       });
                       let path = `M 0 130 L 0 ${points[0].y}`;
                       points.forEach((p, idx) => {
                         if (idx > 0) {
                           const prev = points[idx - 1];
                           const cpX1 = prev.x + (p.x - prev.x) / 2;
                           const cpY1 = prev.y;
                           const cpX2 = prev.x + (p.x - prev.x) / 2;
                           const cpY2 = p.y;
                           path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
                         }
                       });
                       path += ` L ${SCREEN_WIDTH - 64} 130 Z`;
                       return path;
                     })()} 
                     fill="url(#waveGrad)" 
                   />
                   
                   <Path 
                     d={(() => {
                       const maxMinutes = Math.max(...stats.weeklyActivity.map(d => d.minutes), 10);
                       const points = stats.weeklyActivity.map((d, index) => {
                         const x = (index * (SCREEN_WIDTH - 64)) / 6;
                         const y = 90 - (d.minutes / maxMinutes) * 60;
                         return { x, y };
                       });
                       let stroke = `M 0 ${points[0].y}`;
                       points.forEach((p, idx) => {
                         if (idx > 0) {
                           const prev = points[idx - 1];
                           const cpX1 = prev.x + (p.x - prev.x) / 2;
                           const cpY1 = prev.y;
                           const cpX2 = prev.x + (p.x - prev.x) / 2;
                           const cpY2 = p.y;
                           stroke += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
                         }
                       });
                       return stroke;
                     })()} 
                     stroke="#0EA5E9" 
                     strokeWidth="3.5" 
                     fill="none" 
                   />

                   {stats.weeklyActivity.map((d, index) => {
                     const maxMinutes = Math.max(...stats.weeklyActivity.map(d => d.minutes), 10);
                     const x = (index * (SCREEN_WIDTH - 64)) / 6;
                     const y = 90 - (d.minutes / maxMinutes) * 60;
                     const isToday = index === stats.weeklyActivity.length - 1;
                     return (
                       <Circle 
                         key={index} 
                         cx={x} 
                         cy={y} 
                         r={isToday ? "6" : "4"} 
                         fill={isToday ? "#EF5FA0" : "#38BDF8"} 
                         stroke="#FFFFFF" 
                         strokeWidth="1.5" 
                       />
                     );
                   })}
                 </Svg>
                 
                 <View style={styles.daysRowWave}>
                    {stats.weeklyActivity.map((d, i) => {
                      const isToday = i === stats.weeklyActivity.length - 1;
                      return (
                        <Text key={d.day} style={[styles.dayTextWave, isToday && styles.dayTextWaveActive]}>{d.day}</Text>
                      );
                    })}
                 </View>
              </View>
           </Card>
        </View>

        {/* Contacts Stats style widget */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Chỉ số thực hành</Text>
           <Card variant="elevated" style={styles.contactsStatsCard}>
              <View style={styles.donutContainerLeft}>
                 <Svg height="140" width="140" viewBox="0 0 140 140">
                    <Circle cx="70" cy="70" r="52" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                    <Circle cx="70" cy="70" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                    <Circle cx="70" cy="70" r="28" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                    
                    <Circle 
                      cx="70" 
                      cy="70" 
                      r="52" 
                      stroke="#EF5FA0" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray={2 * Math.PI * 52}
                      strokeDashoffset={2 * Math.PI * 52 * (1 - Math.max(stats.vocabularyProgress, 0.05))}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                    />
                    
                    <Circle 
                      cx="70" 
                      cy="70" 
                      r="40" 
                      stroke="#8B5CF6" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - Math.max(stats.avgDictationScore / 100, 0.05))}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                    />
                    
                    <Circle 
                      cx="70" 
                      cy="70" 
                      r="28" 
                      stroke="#0EA5E9" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - Math.max(stats.grammarProgress, 0.05))}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                    />
                    
                    <Circle cx="70" cy="70" r="14" stroke="#CBD5E1" strokeWidth="1.5" fill="#F8FAFC" />
                    <Circle cx="70" cy="70" r="6" stroke="#EF5FA0" strokeWidth="2" fill="#EF5FA0" />
                 </Svg>
              </View>
              
              <View style={styles.contactsStatsRight}>
                 <View style={styles.statDotRow}>
                    <View style={[styles.statSquare, { backgroundColor: '#EF5FA0' }]} />
                    <View style={{ flex: 1 }}>
                       <Text style={styles.statValSmall}>{stats.wordsLearnedToday * 10 + 15} XP</Text>
                       <Text style={styles.statLabelSmall}>Kinh nghiệm hôm nay</Text>
                    </View>
                 </View>
                 <View style={styles.statDotDivider} />
                 <View style={styles.statDotRow}>
                    <View style={[styles.statSquare, { backgroundColor: '#8B5CF6' }]} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.statValSmall}>{formatDuration(stats.totalMinutes)}</Text>
                       <Text style={styles.statLabelSmall}>Luyện nghe & thi thử</Text>
                    </View>
                 </View>
                 <View style={styles.statDotDivider} />
                 <View style={styles.statDotRow}>
                    <View style={[styles.statSquare, { backgroundColor: '#0EA5E9' }]} />
                    <View style={{ flex: 1 }}>
                       <Text style={styles.statValSmall}>{Math.round(stats.vocabularyProgress * 100)}%</Text>
                       <Text style={styles.statLabelSmall}>Tỉ lệ nhớ từ vựng</Text>
                    </View>
                 </View>
              </View>
           </Card>
        </View>

        {/* Green Certificate Issuance style widget */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Đánh giá năng lực</Text>
           <Card variant="elevated" style={styles.certCard}>
              <View style={styles.certTopRow}>
                 <View style={styles.donutOverallContainer}>
                    <Svg height="120" width="120" viewBox="0 0 120 120">
                       <Circle cx="60" cy="60" r="48" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                       
                       <Circle 
                         cx="60" 
                         cy="60" 
                         r="48" 
                         stroke="#FBBF24" 
                         strokeWidth="8" 
                         fill="none" 
                         strokeDasharray={2 * Math.PI * 48}
                         strokeDashoffset={2 * Math.PI * 48 * (1 - Math.max(stats.avgExamScore / 100, 0.05))}
                         strokeLinecap="round"
                         transform="rotate(-90 60 60)"
                       />
                    </Svg>
                    <View style={styles.certPercentBox}>
                       <Text style={styles.certPercentTxt}>{stats.avgExamScore}%</Text>
                       <Text style={styles.certOverallTxt}>OVERALL</Text>
                    </View>
                 </View>
                 
                 <View style={styles.certExplainBox}>
                    <Text style={styles.certTitleTxt}>Chỉ số thi thử</Text>
                    <Text style={styles.certSubtitleTxt}>Đại diện cho năng lực tổng quát tiếng Hàn của học viên.</Text>
                 </View>
              </View>
              
              <View style={styles.certStatsDivider} />
              
              <View style={styles.certStatsBottomRow}>
                 <View style={styles.certStatCol}>
                    <Text style={styles.certStatVal}>{stats.totalExams}</Text>
                    <Text style={styles.certStatLabel}>Đề thi thử</Text>
                 </View>
                 <View style={styles.certVerticalDivider} />
                 <View style={styles.certStatCol}>
                    <Text style={styles.certStatVal}>{stats.totalDictations}</Text>
                    <Text style={styles.certStatLabel}>Bài chính tả</Text>
                 </View>
                 <View style={styles.certVerticalDivider} />
                 <View style={styles.certStatCol}>
                    <Text style={styles.certStatVal}>{stats.wordsLearnedToday}</Text>
                    <Text style={styles.certStatLabel}>Từ hôm nay</Text>
                 </View>
              </View>
           </Card>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  chartCardWave: {
    padding: 24,
    borderRadius: Radius['3xl'],
    backgroundColor: Colors.white,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chartHeaderInfoWave: {
    marginBottom: 15,
  },
  chartTotalWave: {
    fontSize: 26,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  chartPeriodWave: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  waveChartContainer: {
    marginTop: 15,
  },
  waveSvg: {
    width: '100%',
  },
  daysRowWave: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 12,
  },
  dayTextWave: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
  },
  dayTextWaveActive: {
    color: Colors.primary,
  },
  contactsStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: Radius['3xl'],
    backgroundColor: Colors.white,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 20,
  },
  donutContainerLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactsStatsRight: {
    flex: 1,
    gap: 10,
  },
  statDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statSquare: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  statValSmall: {
    fontSize: 15,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  statLabelSmall: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statDotDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  certCard: {
    padding: 24,
    borderRadius: Radius['3xl'],
    backgroundColor: Colors.white,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  certTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  donutOverallContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certPercentBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certPercentTxt: {
    fontSize: 22,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  certOverallTxt: {
    fontSize: 8,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  certExplainBox: {
    flex: 1,
    gap: 6,
  },
  certTitleTxt: {
    fontSize: 16,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  certSubtitleTxt: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  certStatsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  certStatsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  certStatVal: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  certStatLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
    fontWeight: Typography.weights.bold,
  },
  certVerticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
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
