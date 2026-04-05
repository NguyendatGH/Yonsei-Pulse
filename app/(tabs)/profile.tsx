import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { MOCK_USER } from '@/constants/mock-data';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
           <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header Card */}
        <View style={styles.profileHeaderContainer}>
           <LinearGradient
             colors={['#FFF0F3', '#FFE4E8']}
             style={styles.profileCard}
           >
              <View style={styles.avatarContainer}>
                 <Image 
                   source={require('@/assets/images/user_avatar.png')} 
                   style={styles.avatarImg} 
                   contentFit="cover"
                   transition={300}
                 />
                 <TouchableOpacity style={styles.editBadge} activeOpacity={0.8}>
                    <Ionicons name="camera-outline" size={16} color={Colors.white} />
                 </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{MOCK_USER.name}</Text>
              <Text style={styles.userHandle}>@nguyenvana_kr</Text>
              
              <View style={styles.statsOverview}>
                 <View style={styles.overviewItem}>
                    <Text style={styles.overviewVal}>24</Text>
                    <Text style={styles.overviewLabel}>Cấp độ</Text>
                 </View>
                 <View style={styles.overviewDivider} />
                 <View style={styles.overviewItem}>
                    <Text style={styles.overviewVal}>1.2k</Text>
                    <Text style={styles.overviewLabel}>Bạn bè</Text>
                 </View>
                 <View style={styles.overviewDivider} />
                 <View style={styles.overviewItem}>
                    <Text style={styles.overviewVal}>85%</Text>
                    <Text style={styles.overviewLabel}>Hoàn thành</Text>
                 </View>
              </View>
           </LinearGradient>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
           <Text style={styles.menuTitle}>Tài khoản</Text>
           <View style={styles.menuGroup}>
              <SettingItem icon="person-outline" label="Thông tin cá nhân" hasArrow />
              <SettingItem icon="notifications-outline" label="Thông báo" hasArrow />
              <SettingItem icon="shield-checkmark-outline" label="Bảo mật" hasArrow />
           </View>

           <Text style={styles.menuTitle}>Ứng dụng</Text>
           <View style={styles.menuGroup}>
              <SettingItem icon="language-outline" label="Ngôn ngữ ứng dụng" value="Tiếng Việt" hasArrow />
              <SettingItem icon="moon-outline" label="Chế độ tối" hasToggle />
              <SettingItem icon="help-circle-outline" label="Trung tâm hỗ trợ" hasArrow />
           </View>

           <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
              <LinearGradient colors={['#FFF5F5', '#FFEAEA']} style={styles.logoutGrad}>
                 <Ionicons name="log-out-outline" size={22} color={Colors.error} />
                 <Text style={styles.logoutText}>Đăng xuất</Text>
              </LinearGradient>
           </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function SettingItem({ icon, label, value, hasArrow, hasToggle }: any) {
  return (
    <TouchableOpacity style={styles.settingItem} activeOpacity={0.6}>
       <View style={styles.settingIconBox}>
          <Ionicons name={icon} size={22} color={Colors.primary} />
       </View>
       <Text style={styles.settingLabelText}>{label}</Text>
       {value && <Text style={styles.settingValText}>{value}</Text>}
       {hasToggle && (
         <View style={styles.toggleOuter}>
            <View style={styles.toggleInner} />
         </View>
       )}
       {hasArrow && <Ionicons name="chevron-forward-outline" size={18} color={Colors.textTertiary} />}
    </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeaderContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: 10,
  },
  profileCard: {
    borderRadius: Radius['3xl'],
    padding: 30,
    alignItems: 'center',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: '#FFF0F3',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarImg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.white,
    ...Shadows.md,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  userHandle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: Typography.weights.medium,
  },
  statsOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: Radius['2xl'],
    width: '100%',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  overviewVal: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  overviewLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: 35,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: Colors.white,
    borderRadius: Radius['3xl'],
    padding: 8,
    marginBottom: 30,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 16,
  },
  settingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabelText: {
    flex: 1,
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  settingValText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginRight: 4,
    fontWeight: Typography.weights.medium,
  },
  toggleOuter: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFD4DC',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: Radius['2xl'],
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFEAEA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: Typography.weights.extrabold,
    color: Colors.error,
  },
});
