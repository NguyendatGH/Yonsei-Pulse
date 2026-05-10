import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface DictationPlayerProps {
  title?: string;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  speechRate: number;
  currentCharIndex: number;
  totalChars: number;
  waveformHeights: number[];
  onTogglePlayPause: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  onCycleSpeechRate: () => void;
}

export function DictationPlayer({
  title,
  isPlaying,
  positionMillis,
  durationMillis,
  speechRate,
  currentCharIndex,
  totalChars,
  waveformHeights,
  onTogglePlayPause,
  onSeekForward,
  onSeekBackward,
  onCycleSpeechRate,
}: DictationPlayerProps) {
  
  const formatTime = (millis: number) => {
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = totalChars > 0 
    ? (currentCharIndex / totalChars) * 100 
    : (positionMillis / (durationMillis || 1)) * 100;

  return (
    <View style={styles.playerFrame}>
      <Text style={styles.playerTitle} numberOfLines={1}>
        {title || 'Đang luyện nghe'}
      </Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
          <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={onCycleSpeechRate} style={styles.speedBtn}>
          <View style={styles.speedBtnInner}>
            <Text style={styles.speedText}>{speechRate.toFixed(1)}x</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.mainControls}>
          <TouchableOpacity onPress={onSeekBackward} style={styles.seekBtn}>
            <View style={styles.seekBtnInner}>
              <Ionicons name="play-back" size={24} color="#EC4899" />
            </View>
            <Text style={styles.seekSubText}>-5s</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onTogglePlayPause} style={styles.playPauseBtn}>
            <Ionicons 
              name={isPlaying ? "pause" : (positionMillis >= durationMillis - 500 ? "refresh" : "play")} 
              size={36} 
              color={Colors.white} 
              style={{ marginLeft: (isPlaying || positionMillis >= durationMillis - 500) ? 0 : 4 }} 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSeekForward} style={styles.seekBtn}>
            <View style={styles.seekBtnInner}>
              <Ionicons name="play-forward" size={24} color="#EC4899" />
            </View>
            <Text style={styles.seekSubText}>+5s</Text>
          </TouchableOpacity>
        </View>

        <View style={{ width: 44 }} />
      </View>

      <View style={styles.waveformContainer}>
        <View style={styles.waveformBars}>
          {(isPlaying || waveformHeights.length > 0 ? waveformHeights : Array(20).fill(0)).map((height, i) => (
            <View 
              key={i}
              style={[
                styles.waveformBar,
                { 
                  height: isPlaying ? height : (12 + (i % 3) * 6),
                  opacity: isPlaying ? 1 : ((i / 20) <= (positionMillis / (durationMillis || 1)) ? 0.8 : 0.2)
                }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerFrame: {
    backgroundColor: Colors.white,
    borderRadius: Radius['3xl'],
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  speedBtn: {
    width: 44,
  },
  speedBtnInner: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FDF2F8',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  seekBtn: {
    alignItems: 'center',
  },
  seekBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekSubText: {
    fontSize: 10,
    color: '#EC4899',
    fontWeight: '700',
    marginTop: 4,
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformContainer: {
    height: 40,
    justifyContent: 'center',
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  waveformBar: {
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },
});
