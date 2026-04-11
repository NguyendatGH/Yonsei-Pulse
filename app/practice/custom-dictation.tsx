import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Button, Card, ProgressBar, Badge } from '@/components/ui';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/theme';
import { MOCK_LISTENING_PARAGRAPHS } from '@/constants/mock-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type WordPart = {
  id: number;
  original: string;
  display: string;
  isBlank: boolean;
  userInput: string;
  charStart?: number;
  charEnd?: number;
};

type ParagraphData = {
  id: string;
  title: string;
  korean: string;
  fullKorean: string;
  vietnamese: string;
  difficulty: string;
};

export default function DictationPracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState<'source_selection' | 'manual_input' | 'sample_list' | 'setup' | 'practice'>('source_selection');
  const [selectedPara, setSelectedPara] = useState<{title: string, text: string, wordCount?: number} | null>(null);
  const [manualText, setManualText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [blankCount, setBlankCount] = useState<number>(5);
  
  const [wordParts, setWordParts] = useState<WordPart[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.8);
  const [totalChars, setTotalChars] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [waveformKey, setWaveformKey] = useState(0);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWaveformKey(k => k + 1);
        const newHeights = Array(20).fill(0).map((_, i) => 
          10 + Math.abs(Math.sin((Date.now() / 400) + i * 0.3)) * 14
        );
        setWaveformHeights(newHeights);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setWaveformHeights([]);
    }
  }, [isPlaying]);

  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasReceivedBoundary = useRef(false);
  const playbackStartTime = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const audio = new window.Audio();
      webAudioRef.current = audio;
      
      const onTimeUpdate = () => {
        setPositionMillis(audio.currentTime * 1000);
        const dur = (isNaN(audio.duration) || audio.duration === Infinity) ? 1 : audio.duration * 1000;
        setDurationMillis(dur);
      };
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onEnded = () => {
        setIsPlaying(false);
        audio.currentTime = 0;
      };
      const onError = (e: any) => {
        console.error('Web Audio Error:', e);
        setIsPlaying(false);
      };
      
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);

      // Pre-load voices for Chrome
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
      
      return () => {
        audio.pause();
        audio.src = '';
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
      };
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const cycleSpeechRate = async () => {
    const rates = [0.5, 0.8, 1.0, 1.2];
    const nextIndex = (rates.indexOf(speechRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setSpeechRate(nextRate);
    
    if (Platform.OS === 'web') {
      if (isPlaying && selectedPara) {
        window.speechSynthesis.cancel();
        startWebSpeech(selectedPara.text, nextRate);
      }
    } else if (soundRef.current) {
      await soundRef.current.setRateAsync(nextRate, true);
    }
  };

  const processTextForPractice = async (text: string, title: string) => {
    if (text.trim().length < 10) {
      Alert.alert('Lỗi', 'Vui lòng chọn hoặc nhập đoạn văn hợp lệ.');
      return;
    }
    const wordCount = text.split(/\s+/).length;
    setSelectedPara({ title, text, wordCount });
    setBlankCount(Math.min(5, Math.floor(wordCount * 0.3)));
    setStep('setup');
  };

  const startPractice = async () => {
    if (!selectedPara) return;
    
    const text = selectedPara.text;
    const words = text.split(/\s+/);
    const count = Math.min(blankCount, words.length);
    
    const indices = [...Array(words.length).keys()];
    const shuffled = indices.sort(() => Math.random() - 0.5);
    const blankIndices = new Set(shuffled.slice(0, count));
    
    let lastFoundIndex = 0;
    const parts: WordPart[] = words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?]/g, '');
      const isBlank = blankIndices.has(index) && cleanWord.length > 1;
      
      const charStart = text.indexOf(word, lastFoundIndex);
      if (charStart !== -1) {
        lastFoundIndex = charStart + word.length;
      }
      
      const part = {
        id: index,
        original: cleanWord,
        display: word,
        isBlank,
        userInput: '',
        charStart: charStart === -1 ? 0 : charStart,
        charEnd: charStart === -1 ? 0 : charStart + word.length
      };
      
      return part;
    });

    setWordParts(parts);
    setStep('practice');
    await prepareAudio(text, speechRate);
  };

  const prepareAudio = async (textToSpeak: string, rate: number) => {
    const safeText = textToSpeak.replace(/[\r\n]+/g, ' ');
    
    if (Platform.OS === 'web') {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setTotalChars(safeText.length);
      setCurrentCharIndex(0);
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(safeText.substring(0, 200))}` },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      await sound.setRateAsync(rate, true);
    } catch (err) {
      console.warn('Audio load failed', err);
    }
  };

  const startWebSpeech = (text: string, rate: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    setCurrentCharIndex(0);
    setPositionMillis(0);
    hasReceivedBoundary.current = false;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Improved voice selection for Chrome/Web
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(v => v.lang === 'ko-KR' || v.lang.startsWith('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }
    
    utterance.lang = 'ko-KR';
    utterance.rate = rate;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      playbackStartTime.current = Date.now();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentCharIndex(text.length);
      setPositionMillis(durationMillis);
      
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }

      setTimeout(() => {
        setCurrentCharIndex(0);
        setPositionMillis(0);
      }, 1500);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        hasReceivedBoundary.current = true;
        setCurrentCharIndex(event.charIndex);
        
        // --- REAL-TIME CALIBRATION ---
        const elapsed = Date.now() - playbackStartTime.current;
        if (elapsed > 200 && event.charIndex > 0) {
           // Calculate actual speed: characters per millisecond
           const actualCPMS = event.charIndex / elapsed;
           // Recalculate total duration based on actual measured speed
           const newDuration = text.length / actualCPMS;
           setDurationMillis(newDuration);
           setPositionMillis(elapsed);
        } else {
           const progress = event.charIndex / (text.length || 1);
           setPositionMillis(progress * durationMillis);
        }
      }
    };
    
    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      setIsPlaying(false);
    };
    
    speechSynthesisRef.current = utterance;
    
    const charCount = text.length;
    setTotalChars(charCount);
    // 5.5 chars per second to ensure highlights reach the end before end of audio
    const estimatedDuration = (charCount / (rate * 5.5)) * 1000; 
    setDurationMillis(estimatedDuration);

    // Fallback interval for smooth progress bar and highlighting if onboundary fails
    positionIntervalRef.current = setInterval(() => {
      setPositionMillis(prev => {
        const next = prev + 100;
        if (next >= estimatedDuration) {
          // Don't clear yet, wait for onend
          return estimatedDuration;
        }
        
        // Only update char index if onboundary isn't providing higher precision
        if (!hasReceivedBoundary.current) {
          const progress = next / estimatedDuration;
          const fallbackCharIndex = Math.floor(progress * charCount);
          setCurrentCharIndex(curr => Math.max(curr, fallbackCharIndex));
        }
        
        return next;
      });
    }, 100);
    
    window.speechSynthesis.speak(utterance);
  };

  const pauseWebSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
      positionIntervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const resumeWebSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
    const remaining = durationMillis - positionMillis;
    if (remaining > 0 && speechSynthesisRef.current) {
      const charCount = totalChars;
      positionIntervalRef.current = setInterval(() => {
        setPositionMillis(prev => {
          const newPos = prev + 100;
          const startIdx = Math.floor((positionMillis / durationMillis) * charCount);
          const progress = (newPos - positionMillis) / remaining;
          setCurrentCharIndex(Math.floor(startIdx + progress * (remaining / (durationMillis / (remaining / 1000)))));
          return newPos >= durationMillis ? durationMillis : newPos;
        });
      }, 100);
    }
    setIsPlaying(true);
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis || 1);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPositionMillis(0);
      }
    }
  };

  const togglePlayPause = async () => {
    if (Platform.OS === 'web') {
      if (!selectedPara) return;
      
      if (isPlaying) {
        pauseWebSpeech();
      } else {
        if (positionMillis === 0 || positionMillis >= durationMillis - 100) {
          startWebSpeech(selectedPara.text, speechRate);
        } else {
          resumeWebSpeech();
        }
      }
      return;
    }

    if (!soundRef.current) {
      if (selectedPara) await prepareAudio(selectedPara.text, speechRate);
      setTimeout(() => soundRef.current?.playAsync(), 200);
      return;
    }
    
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      const status: any = await soundRef.current.getStatusAsync();
      if (status.positionMillis >= (status.durationMillis || 0) - 100) {
        await soundRef.current.replayAsync();
      } else {
        await soundRef.current.playAsync();
      }
    }
  };

  const fallbackToSpeech = (e?: any) => {
    console.warn('Fallback to native', e);
  };

  const stopAudio = async () => {
    setIsPlaying(false);
    setPositionMillis(0);
    setCurrentCharIndex(0);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    } else if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      } catch (e) {}
    }
  };

  const seekForward = async () => {
    if (Platform.OS === 'web' && webAudioRef.current) {
      const audio = webAudioRef.current;
      if (!isNaN(audio.duration) && audio.duration !== Infinity) {
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
      }
      return;
    }
    if (soundRef.current) {
      const newPos = Math.min(positionMillis + 5000, durationMillis);
      await soundRef.current.setPositionAsync(newPos);
    }
  };

  const seekBackward = async () => {
    if (Platform.OS === 'web' && webAudioRef.current) {
      const audio = webAudioRef.current;
      audio.currentTime = Math.max(audio.currentTime - 5, 0);
      return;
    }
    if (soundRef.current) {
      const newPos = Math.max(positionMillis - 5000, 0);
      await soundRef.current.setPositionAsync(newPos);
    }
  };

  const formatTime = (millis: number) => {
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const checkResults = () => {
    setShowResult(true);
    stopAudio();
  };

  const resetAll = () => {
    setStep('source_selection');
    setSelectedPara(null);
    setWordParts([]);
    setShowResult(false);
    stopAudio();
  };

  // Render sub-sections
  const renderSourceSelection = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setStep('sample_list')} activeOpacity={0.7}>
        <Card variant="elevated" style={styles.sourceCard} >
          <View style={styles.sourceIconContainer}>
            <Ionicons name="library" size={32} color={Colors.primary} />
          </View>
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceTitle}>Chọn bài mẫu</Text>
            <Text style={styles.sourceDesc}>Luyện tập với các bài đọc từ giáo trình Yonsei</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setStep('manual_input')} activeOpacity={0.7}>
        <Card variant="elevated" style={styles.sourceCard} >
          <View style={styles.sourceIconContainer}>
            <Ionicons name="create" size={32} color={Colors.accent} />
          </View>
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceTitle}>Nhập văn bản mới</Text>
            <Text style={styles.sourceDesc}>Dán đoạn văn bạn muốn luyện nghe vào đây</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
        </Card>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSampleList = () => (
    <FlatList
      data={MOCK_LISTENING_PARAGRAPHS as unknown as ParagraphData[]}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.scrollContent}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => processTextForPractice(item.fullKorean, item.title)} activeOpacity={0.7}>
          <Card variant="outlined" style={styles.sampleItem}>
            <Text style={styles.sampleTitle}>{item.title}</Text>
            <Text style={styles.sampleSnippet} numberOfLines={2}>{item.fullKorean}</Text>
            <View style={styles.sampleMeta}>
              <Badge label={item.difficulty} variant="accent" />
              <Text style={styles.sampleLength}>{item.fullKorean.length} ký tự</Text>
            </View>
          </Card>
        </TouchableOpacity>
      )}
    />
  );

  const renderManualInput = () => (
    <View style={styles.manualContainer}>
      <Card variant="default" style={styles.inputCard}>
        <TextInput
          style={styles.manualTitleInput}
          placeholder="Tiêu đề bài nghe (không bắt buộc)"
          value={manualTitle}
          onChangeText={setManualTitle}
        />
        <TextInput
          style={styles.manualTextInput}
          placeholder="Nhập hoặc dán văn bản tiếng Hàn tại đây..."
          multiline
          value={manualText}
          onChangeText={setManualText}
          textAlignVertical="top"
        />
      </Card>
      <Button
        title="Bắt đầu luyện tập"
        onPress={() => processTextForPractice(manualText, manualTitle || 'Bài tự nhập')}
        fullWidth
        size="lg"
        disabled={manualText.trim().length < 10}
        style={styles.startBtn}
      />
    </View>
  );

  const renderSetup = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card variant="elevated" style={styles.setupCard}>
        <View style={styles.setupHeader}>
          <Ionicons name="settings" size={28} color={Colors.primary} />
          <Text style={styles.setupTitle}>Cài đặt bài luyện tập</Text>
        </View>
        
        <View style={styles.setupSection}>
          <Text style={styles.setupLabel}>Số từ bị ẩn</Text>
          <Text style={styles.setupDesc}>
            Đoạn văn có {selectedPara?.wordCount || 0} từ - chọn số từ cần ẩn
          </Text>
          
          <View style={styles.blankCountContainer}>
            <TouchableOpacity 
              style={styles.blankCountBtn}
              onPress={() => setBlankCount(Math.max(1, blankCount - 1))}
            >
              <Ionicons name="remove" size={24} color={Colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.blankCountDisplay}>
              <Text style={styles.blankCountText}>{blankCount}</Text>
              <Text style={styles.blankCountLabel}>từ</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.blankCountBtn}
              onPress={() => setBlankCount(Math.min(selectedPara?.wordCount || 10, blankCount + 1))}
            >
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.blankSliderContainer}>
            <Text style={styles.blankSliderLabel}>Tỷ lệ: {Math.round((blankCount / (selectedPara?.wordCount || 1)) * 100)}%</Text>
            <View style={styles.blankSliderTrack}>
              <View style={[styles.blankSliderFill, { width: `${(blankCount / (selectedPara?.wordCount || 1)) * 100}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.setupSection}>
          <Text style={styles.setupLabel}>Tốc độ đọc</Text>
          <View style={styles.ratioContainer}>
            {[0.5, 0.8, 1.0, 1.2].map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[
                  styles.ratioBtn,
                  speechRate === rate && styles.ratioBtnActive
                ]}
                onPress={() => setSpeechRate(rate)}
              >
                <Text style={[
                  styles.ratioBtnText,
                  speechRate === rate && styles.ratioBtnTextActive
                ]}>
                  {rate}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Bắt đầu luyện tập"
          onPress={startPractice}
          fullWidth
          size="lg"
          style={styles.startPracticeBtn}
        />
      </Card>
    </ScrollView>
  );

  const renderPractice = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.modernPlayerFrame}>
        <Text style={styles.playerTitleText} numberOfLines={1}>
          {selectedPara?.title}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: totalChars > 0 
                    ? `${(currentCharIndex / totalChars) * 100}%` 
                    : `${(positionMillis / (durationMillis || 1)) * 100}%` 
                }
              ]} 
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
            <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={cycleSpeechRate} style={styles.speedBtnPlayer}>
            <View style={styles.speedBtnInner}>
              <Text style={styles.speedTextPlayer}>{speechRate.toFixed(1)}x</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.mainControls}>
            <TouchableOpacity onPress={seekBackward} style={styles.seekBtn}>
              <View style={styles.seekBtnInner}>
                <Ionicons name="play-back" size={24} color="#EC4899" />
              </View>
              <Text style={styles.seekSubText}>-5s</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseLargeBtn}>
              <Ionicons 
                name={isPlaying ? "pause" : (positionMillis >= durationMillis - 500 ? "refresh" : "play")} 
                size={36} 
                color={Colors.white} 
                style={{ marginLeft: (isPlaying || positionMillis >= durationMillis - 500) ? 0 : 4 }} 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={seekForward} style={styles.seekBtn}>
              <View style={styles.seekBtnInner}>
                <Ionicons name="play-forward" size={24} color="#EC4899" />
              </View>
              <Text style={styles.seekSubText}>+5s</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptySpace} />
        </View>

        <View style={styles.waveformContainer}>
          {isPlaying ? (
            <View style={styles.waveformBars}>
              {waveformHeights.length > 0 ? (
                waveformHeights.map((height, i) => (
                  <View 
                    key={`anim-${i}`}
                    style={[
                      styles.waveformBar,
                      { height, opacity: 1 }
                    ]}
                  />
                ))
              ) : (
                [...Array(20)].map((_, i) => (
                  <View 
                    key={`anim-${i}`}
                    style={[
                      styles.waveformBar,
                      { height: 12 + Math.sin(i * 0.4) * 8, opacity: 1 }
                    ]}
                  />
                ))
              )}
            </View>
          ) : (
            <View style={styles.waveformBars}>
              {[...Array(20)].map((_, i) => (
                <View 
                  key={`static-${i}`}
                  style={[
                    styles.waveformBar,
                    { 
                      height: 12 + (i % 3) * 6,
                      opacity: (i / 20) <= (positionMillis / (durationMillis || 1)) ? 0.8 : 0.2
                    }
                  ]} 
                />
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.practiceSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="headset" size={20} color={Colors.primary} />
          <Text style={styles.sectionLabel}>Điền vào chỗ trống</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>
              {wordParts.filter(p => p.isBlank && p.userInput.trim().toLowerCase() === p.original.toLowerCase()).length}
            </Text>
            <Text style={styles.statsLabel}>Đúng</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>
              {wordParts.filter(p => p.isBlank).length}
            </Text>
            <Text style={styles.statsLabel}>Tổng ẩn</Text>
          </View>
        </View>

        <Card variant="default" style={styles.clozeContainer}>
          <View style={styles.clozeGrid}>
            {wordParts.map((part, index) => {
              const isActive = isPlaying && 
                part.charStart !== undefined && 
                part.charEnd !== undefined && 
                currentCharIndex >= part.charStart && 
                currentCharIndex < part.charEnd + 2; // Tolerance for spaces

              return (
                <View key={part.id} style={[styles.wordBox, isActive && styles.activeWordBox]}>
                  {part.isBlank ? (
                    <View>
                      <TextInput
                        style={[
                          styles.wordInput,
                          isActive && styles.activeWordInput,
                          showResult && (part.userInput.trim().toLowerCase() === part.original.toLowerCase() ? styles.wordCorrect : styles.wordWrong)
                        ]}
                        value={part.userInput}
                        onChangeText={(val) => {
                          const updated = [...wordParts];
                          updated[index].userInput = val;
                          setWordParts(updated);
                        }}
                        autoCorrect={false}
                        autoCapitalize="none"
                        editable={!showResult}
                      />
                      {showResult && part.userInput.trim().toLowerCase() !== part.original.toLowerCase() && (
                        <Text style={styles.answerText}>{part.original}</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={[styles.plainText, isActive && styles.activePlainText]}>
                      {part.display}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {!showResult ? (
        <Button
          title="Kiểm tra bài"
          onPress={checkResults}
          fullWidth
          size="lg"
          style={styles.mainActionBtn}
        />
      ) : (
        <Button
          title="Luyện tập lại"
          onPress={resetAll}
          variant="outline"
          fullWidth
          size="lg"
          style={styles.mainActionBtn}
        />
      )}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step === 'source_selection' ? router.back() : resetAll()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nghe & Điền từ</Text>
          <TouchableOpacity style={styles.infoBtn} onPress={resetAll}>
            <Ionicons name="refresh" size={22} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.stepIndicator}>
          <Badge 
            label={
              step === 'source_selection' ? 'Bước 1: Chọn nguồn' : 
              step === 'practice' ? 'Bước 2: Thực hành' : 'Thiết lập văn bản'
            } 
            variant="info" 
          />
        </View>

        {step === 'source_selection' && renderSourceSelection()}
        {step === 'sample_list' && renderSampleList()}
        {step === 'manual_input' && renderManualInput()}
        {step === 'setup' && renderSetup()}
        {step === 'practice' && renderPractice()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' } as any,
      default: Shadows.sm
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: Radius.xl,
  },
  sourceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sourceDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sampleItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: Radius.lg,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sampleSnippet: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  sampleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sampleLength: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  manualContainer: {
    flex: 1,
    padding: Spacing.xl,
  },
  inputCard: {
    padding: 16,
    minHeight: 300,
    marginBottom: 20,
  },
  manualTitleInput: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  manualTextInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  startBtn: {
    marginTop: 'auto',
  },
  setupCard: {
    padding: 24,
    borderRadius: Radius['3xl'],
    marginTop: 10,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  setupSection: {
    marginBottom: 28,
  },
  setupLabel: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  setupDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  blankCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  blankCountBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankCountDisplay: {
    alignItems: 'center',
  },
  blankCountText: {
    fontSize: 36,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  blankCountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  blankSliderContainer: {
    alignItems: 'center',
  },
  blankSliderLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  blankSliderTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  blankSliderFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  ratioContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ratioBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  ratioBtnActive: {
    backgroundColor: Colors.primary,
  },
  ratioBtnText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  ratioBtnTextActive: {
    color: Colors.white,
  },
  ratioSliderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  ratioSliderLabel: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 12,
  },
  ratioSliderTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratioSliderFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  startPracticeBtn: {
    marginTop: 8,
  },
  modernPlayerFrame: {
    padding: 24,
    borderRadius: Radius['3xl'],
    backgroundColor: '#FFF5F9',
    marginTop: 10,
    ...Platform.select({
      web: { boxShadow: '0px 6px 12px rgba(239, 95, 160, 0.08)' } as any,
      default: Shadows.md
    }),
  },
  playerTitleText: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#FBCFE8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: '#F472B6',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emptySpace: {
    width: 50,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  playPauseLargeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 8px 24px rgba(236, 72, 153, 0.4)' } as any,
      default: { ...Shadows.xl, shadowColor: '#EC4899' }
    }),
  },
  seekBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(236, 72, 153, 0.15)' } as any,
      default: Shadows.sm
    }),
  },
  seekSubText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: '#EC4899',
    marginTop: 6,
  },
  speedBtnPlayer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(236, 72, 153, 0.15)' } as any,
      default: Shadows.sm
    }),
  },
  speedBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedTextPlayer: {
    fontSize: 14,
    fontWeight: Typography.weights.extrabold,
    color: '#EC4899',
  },
  waveformContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: '100%',
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#EC4899',
    borderRadius: 2,
  },
  practiceSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 20,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.primary,
    opacity: 0.2,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clozeContainer: {
    padding: 20,
    borderRadius: Radius.xl,
    marginBottom: 24,
  },
  clozeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  wordBox: {
    marginRight: 6,
    marginVertical: 4,
    borderRadius: 4,
  },
  activeWordBox: {
    backgroundColor: '#FFF1F2',
    transform: [{ scale: 1.1 }],
  },
  plainText: {
    fontSize: 18,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  activePlainText: {
    color: Colors.primary,
    fontWeight: Typography.weights.extrabold,
  },
  wordInput: {
    minWidth: 40,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    fontSize: 18,
    textAlign: 'center',
    padding: 0,
    height: 30,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  activeWordInput: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
    backgroundColor: '#FFF1F2',
  },
  wordCorrect: {
    borderBottomColor: '#10B981',
    color: '#10B981',
  },
  wordWrong: {
    borderBottomColor: '#EF4444',
    color: '#EF4444',
  },
  answerText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: Typography.weights.bold,
    marginTop: 2,
    textAlign: 'center',
  },
  mainActionBtn: {
    marginBottom: 20,
  },
});
