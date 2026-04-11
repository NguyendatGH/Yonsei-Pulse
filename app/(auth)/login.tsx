import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

import { userRepo } from '@/db/repos/userRepo';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập thông tin đăng nhập');
      return;
    }

    setLoading(true);
    try {
      // Mock local check: fetch any user and compare email if needed, 
      // or just check if the user exists in our local DB.
      const user = await userRepo.getCurrentUser();
      
      if (user) {
        // In a real app we'd verify password hash. For now, we simulate success.
        router.replace('/(tabs)');
      } else {
        alert('Tài khoản không tồn tại. Vui lòng đăng ký.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
             <Text style={styles.title}>Đăng nhập</Text>
             <Text style={styles.subtitle}>Chào mừng bạn quay trở lại!</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputWrapper}>
             <Text style={styles.inputLabel}>Email hoặc số điện thoại</Text>
             <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />
                <TextInput 
                  style={styles.inputText}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
             </View>
          </View>

          <View style={styles.inputWrapper}>
             <Text style={styles.inputLabel}>Mật khẩu</Text>
             <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />
                <TextInput 
                  style={styles.inputText}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity>
                  <Ionicons name="eye-outline" size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
             </View>
          </View>

          <TouchableOpacity style={styles.forgotPass}>
             <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Button 
            title={loading ? "Đang xử lý..." : "Đăng nhập"}
            onPress={handleLogin}
            fullWidth
            size="lg"
            style={styles.loginBtn}
            disabled={loading}
          />

          <View style={styles.orSection}>
             <View style={styles.line} />
             <Text style={styles.orText}>Hoặc tiếp tục với</Text>
             <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
             <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={24} color="#EA4335" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
             </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
           <Text style={styles.footerText}>Bạn mới tham gia? </Text>
           <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signUpLink}>Đăng ký ngay</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  topSection: {
    paddingTop: 60,
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  headerTextContainer: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  formSection: {
    gap: Spacing.lg,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputText: {
    flex: 1,
    marginLeft: 12,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    height: '100%',
  },
  forgotPass: {
    alignSelf: 'flex-end',
  },
  forgotPassText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  loginBtn: {
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
  },
  orSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: Spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
  },
});
