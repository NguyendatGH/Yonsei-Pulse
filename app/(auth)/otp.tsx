import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';

export default function OTPScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
           <Text style={styles.title}>Xác thực mã OTP</Text>
           <Text style={styles.subtitle}>
              Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra và nhập mã bên dưới.
           </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.otpGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.otpBox}>
              <TextInput
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                placeholderTextColor={Colors.textTertiary}
                placeholder="•"
              />
            </View>
          ))}
        </View>

        <View style={styles.resendWrapper}>
           {timer > 0 ? (
             <Text style={styles.resendText}>Gửi lại mã sau <Text style={styles.timer}>{timer}s</Text></Text>
           ) : (
             <TouchableOpacity>
                <Text style={styles.resendAction}>Gửi lại mã ngay</Text>
             </TouchableOpacity>
           )}
        </View>

        <Button 
          title="Xác nhận"
          onPress={() => router.push('/success')}
          fullWidth
          size="lg"
          style={styles.verifyBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
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
    fontSize: 28,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: Typography.weights.medium,
  },
  content: {
    gap: Spacing.xl,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendWrapper: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  timer: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  resendAction: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
  },
  verifyBtn: {
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
  },
});
