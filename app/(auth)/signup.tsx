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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';

import { userRepo } from '@/db/repos/userRepo';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignup = async () => {
    if (!name || !email) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    setLoading(true);
    try {
      await userRepo.createUser({ name, email });
      router.push('/success');
    } catch (err) {
      console.error('Signup error:', err);
      alert('Đăng ký không thành công. Có thể email đã tồn tại.');
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
             <Text style={styles.title}>Đăng ký</Text>
             <Text style={styles.subtitle}>Tạo tài khoản để bắt đầu học ngay!</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputWrapper}>
             <Text style={styles.inputLabel}>Họ và tên</Text>
             <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={20} color={Colors.textTertiary} />
                <TextInput 
                  style={styles.inputText}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={Colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                />
             </View>
          </View>

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
                  placeholder="Tạo mật khẩu"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
             </View>
          </View>

          <View style={styles.termsRow}>
             <TouchableOpacity style={styles.checkbox}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
             </TouchableOpacity>
             <Text style={styles.termsText}>
                Tôi đồng ý với <Text style={styles.linkText}>Điều khoản dịch vụ</Text> và <Text style={styles.linkText}>Chính sách bảo mật</Text>
             </Text>
          </View>

          <Button 
            title={loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
            onPress={handleSignup}
            fullWidth
            size="lg"
            style={styles.signupBtn}
            disabled={loading}
          />
        </View>

        <View style={styles.footer}>
           <Text style={styles.footerText}>Đã có tài khoản? </Text>
           <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    paddingRight: 10,
  },
  checkbox: {
    marginTop: -2,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  signupBtn: {
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
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
  loginLink: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
  },
});
