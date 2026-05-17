import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

interface SourceSelectionProps {
  onSelectSample: () => void;
  onSelectManual: () => void;
}

export function SourceSelection({ onSelectSample, onSelectManual }: SourceSelectionProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={onSelectManual} activeOpacity={0.7}>
        <Card variant="elevated" style={styles.sourceCard}>
          <View style={styles.sourceIconContainer}>
            <Ionicons name="create" size={32} color={Colors.accent} />
          </View>
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceTitle}>Tự nhập văn bản</Text>
            <Text style={styles.sourceDesc}>Dán đoạn văn bạn muốn luyện nghe vào đây</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSelectSample} activeOpacity={0.7}>
        <Card variant="elevated" style={styles.sourceCard}>
          <View style={styles.sourceIconContainer}>
            <Ionicons name="library" size={32} color={Colors.primary} />
          </View>
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceTitle}>Luyện cùng nội dung giáo trình New Yonsei Korean</Text>
            <Text style={styles.sourceDesc}>Luyện tập với các bài đọc từ giáo trình Yonsei</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
        </Card>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.xl,
    gap: 16,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  sourceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sourceDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
