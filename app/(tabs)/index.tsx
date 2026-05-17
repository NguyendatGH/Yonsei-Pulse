import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Card, ProgressBar, Badge } from "@/components/ui";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "@/constants/theme";
import { useUser } from "@/hooks/use-user";
import { useCourses } from "@/hooks/use-courses";
import { useTheme } from "@/hooks/use-theme";
import {
  MOCK_DAILY_STATS,
  MOCK_QUICK_ACTIONS,
  MOCK_CULTURE_TIPS,
} from "@/constants/mock-data";
import { Image } from "expo-image";
import { statsRepo } from "@/db/repos/statsRepo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: userLoading, refreshUser } = useUser();
  const { courses, loading: coursesLoading } = useCourses();
  const { theme, isDark } = useTheme();
  const [stats, setStats] = React.useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      const loadRealStats = async () => {
        try {
          const s = await statsRepo.getStats();
          if (isMounted) {
            setStats(s);
          }
          await refreshUser();
        } catch (err) {
          console.error("Failed to load stats on home:", err);
        }
      };
      loadRealStats();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const tipIndex = getDayOfYear(new Date()) % MOCK_CULTURE_TIPS.length;
  const cultureTip = MOCK_CULTURE_TIPS[tipIndex];

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "CHÀO BUỔI SÁNG";
    if (hour >= 12 && hour < 18) return "CHÀO BUỔI CHIỀU";
    if (hour >= 18 && hour < 22) return "CHÀO BUỔI TỐI";
    return "CHÀO BUỔI ĐÊM";
  };

  if (userLoading || coursesLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user || courses.length === 0) return null;



  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10 },
        ]}
      >
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("@/assets/images/greeting.png")}
            style={styles.bannerImage}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
            style={styles.bannerOverlay}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.bannerSub}>{getGreeting()}</Text>
                <Text style={styles.bannerMain}>안녕하세요, {user.name}! ✨</Text>
              </View>
              <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.8}>
                <Image
                  source={
                    user.avatar
                      ? { uri: user.avatar }
                      : require("@/assets/images/user_avatar.png")
                  }
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.dailyQuoteBox}>
              <Text style={styles.quoteText}>
                &quot;Hành trình vạn dặm bắt đầu từ một bước chân.&quot;
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Daily Stats Summary */}
        <View style={styles.statsOverviewRow}>
          <Card variant="elevated" style={styles.statMiniCard}>
            <Ionicons name="flame" size={18} color="#FF96BB" />
            <Text style={styles.statMiniVal}>{stats ? stats.streak : (user ? user.streak : 0)}</Text>
            <Text style={styles.statMiniLabel}>Ngày chuỗi</Text>
          </Card>
          <Card variant="elevated" style={styles.statMiniCard}>
            <Ionicons name="flash" size={18} color="#FBBF24" />
            <Text style={styles.statMiniVal}>{(stats ? stats.xp : (user ? user.xp : 0)).toLocaleString()}</Text>
            <Text style={styles.statMiniLabel}>Kinh nghiệm</Text>
          </Card>
          <Card variant="elevated" style={styles.statMiniCard}>
            <Ionicons name="checkmark-circle" size={18} color="#34D399" />
            <Text style={styles.statMiniVal}>{stats ? stats.completedLessons : (user ? user.completedLessons : 0)}</Text>
            <Text style={styles.statMiniLabel}>Bài đã học</Text>
          </Card>
          <Card variant="elevated" style={styles.statMiniCard}>
            <Ionicons name="ribbon" size={18} color="#8B5CF6" />
            <Text style={styles.statMiniVal}>
              {stats 
                ? (stats.totalExams + stats.totalDictations + stats.masteredFlashcards) 
                : (user ? (user.completedPractices || 0) : 0)}
            </Text>
            <Text style={styles.statMiniLabel}>Bài đã luyện</Text>
          </Card>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Luyện tập nhanh</Text>
          </View>
          <View style={styles.quickActionGrid}>
            {MOCK_QUICK_ACTIONS.filter((a) => a.id !== "custom").map(
              (action) => (
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
                    <Ionicons
                      name={`${action.icon}-outline` as any}
                      size={32}
                      color={action.color}
                    />
                  </LinearGradient>
                  <Text style={styles.actionLabel}>{action.title}</Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Custom Content CTA */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.customCTACard}
            activeOpacity={0.9}
            onPress={() => router.push("/practice/custom-dictation")}
          >
            <LinearGradient
              colors={["#8B5CF6", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.customCTAGradient}
            >
              <View style={styles.customCTALeft}>
                <View style={styles.customCTAIconBox}>
                  <Ionicons name="headset" size={26} color="#8B5CF6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customCTATitle}>
                    Luyện nghe & Dictation
                  </Text>
                  <Text style={styles.customCTASub}>
                    Học qua điền từ vựng khi nghe văn bản
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.white} />
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
                <Text style={styles.tipTitle}>{cultureTip.title}</Text>
                <Text style={styles.tipDesc} numberOfLines={2}>
                  {cultureTip.description}
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
    backgroundColor: "#FAF9FB",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF9FB",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    height: 220,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    ...Shadows.lg,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    justifyContent: "space-between",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerSub: {
    fontSize: 11,
    fontWeight: Typography.weights.extrabold,
    color: "rgba(255,255,255,0.8)",
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
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  dailyQuoteBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.xl,
    alignSelf: "flex-start",
  },
  quoteText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: Typography.weights.medium,
    fontStyle: "italic",
  },
  statsOverviewRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    marginTop: 25,
    gap: 12,
  },
  statMiniCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: Radius["2xl"],
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
    textTransform: "uppercase",
  },
  section: {
    marginTop: 35,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  actionItem: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - 36) / 4,
    alignItems: "center",
    gap: 8,
  },
  actionIconBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: Radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  activeCourseCard: {
    width: "100%",
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    ...Shadows.md,
  },
  activeCourseGrad: {
    padding: 24,
  },
  activeCourseTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  courseIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCourseTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
  },
  activeCourseSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: Typography.weights.medium,
  },
  activeCourseProgress: {
    marginTop: 24,
  },
  progHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progText: {
    color: "rgba(255,255,255,0.8)",
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
    borderRadius: Radius["2xl"],
    borderColor: "#F1F5F9",
  },
  tipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tipIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: Radius["3xl"],
    overflow: "hidden",
    ...Shadows.md,
  },
  customCTAGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    gap: 16,
  },
  customCTALeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  customCTAIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  customCTATitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
  },
  customCTASub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: Typography.weights.medium,
  },
});
