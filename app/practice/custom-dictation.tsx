import React, { useState, useEffect, useRef } from "react";
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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system";
import { Button, Card, ProgressBar, Badge } from "@/components/ui";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
} from "@/constants/theme";
import { MOCK_LISTENING_PARAGRAPHS } from "@/constants/mock-data";
import { SourceSelection } from "@/components/practice/dictation/SourceSelection";
import { DictationPlayer } from "@/components/practice/dictation/DictationPlayer";
import { DictationResults } from "@/components/practice/dictation/DictationResults";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

type YonseiTopic = {
  id: string;
  title: string;
  vietnamese: string;
  level: string;
  book: string;
  page: number;
};

const YONSEI_TOPICS: YonseiTopic[] = [
  // Sơ cấp 1
  { id: "s1_1", title: "인사와 소개", vietnamese: "Chào hỏi & Giới thiệu", level: "Sơ cấp 1", book: "YONSEI 1-1", page: 12 },
  { id: "s1_2", title: "학교 생활", vietnamese: "Sinh hoạt học đường", level: "Sơ cấp 1", book: "YONSEI 1-1", page: 28 },
  { id: "s1_3", title: "음식", vietnamese: "Thức ăn & Ăn uống", level: "Sơ cấp 1", book: "YONSEI 1-1", page: 45 },
  { id: "s1_4", title: "가족", vietnamese: "Gia đình yêu thương", level: "Sơ cấp 1", book: "YONSEI 1-1", page: 62 },
  { id: "s1_5", title: "하루 일과", vietnamese: "Sinh hoạt hằng ngày", level: "Sơ cấp 1", book: "YONSEI 1-1", page: 78 },

  // Sơ cấp 2
  { id: "s2_1", title: "날씨와 계절", vietnamese: "Thời tiết & Mùa", level: "Sơ cấp 2", book: "YONSEI 1-2", page: 94 },
  { id: "s2_2", title: "쇼핑", vietnamese: "Mua sắm & Giá cả", level: "Sơ cấp 2", book: "YONSEI 1-2", page: 110 },
  { id: "s2_3", title: "교통", vietnamese: "Giao thông & Đi lại", level: "Sơ cấp 2", book: "YONSEI 1-2", page: 126 },
  { id: "s2_4", title: "약속", vietnamese: "Hẹn gặp & Gặp gỡ", level: "Sơ cấp 2", book: "YONSEI 1-2", page: 142 },

  // Trung cấp 1
  { id: "t1_1", title: "여행 계획", vietnamese: "Kế hoạch du lịch", level: "Trung cấp 1", book: "YONSEI 3-1", page: 102 },
  { id: "t1_2", title: "취미 생활", vietnamese: "Sở thích cá nhân", level: "Trung cấp 1", book: "YONSEI 3-1", page: 118 },
  { id: "t1_3", title: "건강 và 생활", vietnamese: "Sức khỏe & Đời sống", level: "Trung cấp 1", book: "YONSEI 3-1", page: 134 },
  { id: "t1_4", title: "우편과 소포", vietnamese: "Bưu điện & Bưu phẩm", level: "Trung cấp 1", book: "YONSEI 3-1", page: 150 },

  // Trung cấp 2
  { id: "t2_1", title: "직장 생활", vietnamese: "Đời sống công sở", level: "Trung cấp 2", book: "YONSEI 3-2", page: 166 },
  { id: "t2_2", title: "공연과 관람", vietnamese: "Biểu diễn & Thưởng thức", level: "Trung cấp 2", book: "YONSEI 3-2", page: 182 },
  { id: "t2_3", title: "사고와 수리", vietnamese: "Sự cố & Sửa chữa", level: "Trung cấp 2", book: "YONSEI 3-2", page: 198 },

  // Cao cấp 1
  { id: "c1_1", title: "한국의 역사", vietnamese: "Lịch sử Hàn Quốc", level: "Cao cấp 1", book: "YONSEI 5-1", page: 214 },
  { id: "c1_2", title: "현대 사회와 문제", vietnamese: "Xã hội hiện đại", level: "Cao cấp 1", book: "YONSEI 5-1", page: 230 },
  { id: "c1_3", title: "과학과 기술", vietnamese: "Khoa học & Công nghệ", level: "Cao cấp 1", book: "YONSEI 5-1", page: 246 },

  // Cao cấp 2
  { id: "c2_1", title: "전통 예술", vietnamese: "Nghệ thuật truyền thống", level: "Cao cấp 2", book: "YONSEI 5-2", page: 262 },
  { id: "c2_2", title: "철학과 사상", vietnamese: "Triết học & Tư tưởng", level: "Cao cấp 2", book: "YONSEI 5-2", page: 278 },
  { id: "c2_3", title: "문학의 이해", vietnamese: "Thấu hiểu văn học", level: "Cao cấp 2", book: "YONSEI 5-2", page: 294 },
];

export default function DictationPracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<
    "source_selection" | "manual_input" | "sample_list" | "yonsei_input" | "setup" | "practice"
  >("source_selection");
  const [selectedLevel, setSelectedLevel] = useState("Sơ cấp 1");
  const [selectedYonseiTopic, setSelectedYonseiTopic] = useState<YonseiTopic | null>(null);
  const [yonseiText, setYonseiText] = useState("");
  const [selectedPara, setSelectedPara] = useState<{
    title: string;
    text: string;
    wordCount?: number;
  } | null>(null);
  const [manualText, setManualText] = useState("");
  const [manualTitle, setManualTitle] = useState("");
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
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  useEffect(() => {
    async function loadVoices() {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const koVoices = voices.filter(v => v.language.startsWith('ko') || v.language.toLowerCase() === 'ko-kr');
        setAvailableVoices(koVoices);
        if (koVoices.length > 0) {
          const defVoice = koVoices.find(v => (v.quality as string) === 'enhanced' || v.name.includes('Premium')) || koVoices[0];
          setSelectedVoice(defVoice.identifier);
        }
      } catch (e) {
        console.warn('Error loading TTS voices:', e);
      }
    }
    loadVoices();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWaveformKey((k) => k + 1);
        const newHeights = Array(20)
          .fill(0)
          .map(
            (_, i) => 10 + Math.abs(Math.sin(Date.now() / 400 + i * 0.3)) * 14,
          );
        setWaveformHeights(newHeights);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setWaveformHeights([]);
    }
  }, [isPlaying]);

  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const hasReceivedBoundary = useRef(false);
  const playbackStartTime = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS === "web") {
      const audio = new window.Audio();
      webAudioRef.current = audio;

      const onTimeUpdate = () => {
        setPositionMillis(audio.currentTime * 1000);
        const dur =
          isNaN(audio.duration) || audio.duration === Infinity
            ? 1
            : audio.duration * 1000;
        setDurationMillis(dur);
      };
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onEnded = () => {
        setIsPlaying(false);
        audio.currentTime = 0;
      };
      const onError = (e: any) => {
        console.error("Web Audio Error:", e);
        setIsPlaying(false);
      };

      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);

      // Pre-load & cache voices for Chrome (async)
      if (window.speechSynthesis) {
        const loadVoicesList = () => {
          window.speechSynthesis.getVoices(); // trigger cache
        };
        loadVoicesList();
        // Chrome fires onvoiceschanged when voices are ready
        if (window.speechSynthesis.onvoiceschanged === null || window.speechSynthesis.onvoiceschanged === undefined) {
          window.speechSynthesis.addEventListener('voiceschanged', loadVoicesList);
        }
      }

      return () => {
        audio.pause();
        audio.src = "";
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
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

    if (Platform.OS === "web") {
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
      Alert.alert("Lỗi", "Vui lòng chọn hoặc nhập đoạn văn hợp lệ.");
      return;
    }
    const wordCount = text.split(/\s+/).length;
    setSelectedPara({ title, text, wordCount });
    setBlankCount(Math.min(5, Math.floor(wordCount * 0.3)));
    setStep("setup");
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
      const cleanWord = word.replace(/[.,!?]/g, "");
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
        userInput: "",
        charStart: charStart === -1 ? 0 : charStart,
        charEnd: charStart === -1 ? 0 : charStart + word.length,
      };

      return part;
    });

    setWordParts(parts);
    setStep("practice");
    await prepareAudio(text, speechRate);
  };

  const prepareAudio = async (textToSpeak: string, rate: number) => {
    const safeText = textToSpeak.replace(/[\r\n]+/g, " ");

    if (Platform.OS === "web") {
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
        {
          uri: `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(safeText.substring(0, 200))}`,
        },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
      );
      soundRef.current = sound;
      await sound.setRateAsync(rate, true);
    } catch (err) {
      console.warn("Audio load failed", err);
    }
  };

  const startWebSpeech = (text: string, rate: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setCurrentCharIndex(0);
    setPositionMillis(0);
    hasReceivedBoundary.current = false;

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Chrome loads voices asynchronously — always try to grab latest list
      const voices = window.speechSynthesis.getVoices();
      
      // Lọc tất cả các giọng tiếng Hàn
      const koVoices = voices.filter(v => v.lang === "ko-KR" || v.lang.startsWith("ko"));
      
      // Ưu tiên các giọng đọc Premium / Natural (Google, Microsoft Online, v.v)
      const premiumVoice = koVoices.find(v => 
        v.name.includes("Google") || 
        v.name.includes("Online") || 
        v.name.includes("Natural") ||
        v.name.includes("Yumi")
      );
      
      const koreanVoice = premiumVoice || koVoices[0];
      
      if (koreanVoice) {
        utterance.voice = koreanVoice;
      }
      // Always set lang so browser uses Korean TTS even without explicit voice
      utterance.lang = "ko-KR";
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
        if (event.name === "word") {
          hasReceivedBoundary.current = true;
          setCurrentCharIndex(event.charIndex);

          // --- REAL-TIME CALIBRATION ---
          const elapsed = Date.now() - playbackStartTime.current;
          if (elapsed > 200 && event.charIndex > 0) {
            const actualCPMS = event.charIndex / elapsed;
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
        // 'interrupted' fires when cancel() is called — not a real error
        if ((e as any).error === "interrupted") return;
        console.warn("Speech error:", e);
        setIsPlaying(false);
      };

      speechSynthesisRef.current = utterance;

      const charCount = text.length;
      setTotalChars(charCount);
      const estimatedDuration = (charCount / (rate * 5.5)) * 1000;
      setDurationMillis(estimatedDuration);

      // Fallback interval for smooth progress bar
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
      positionIntervalRef.current = setInterval(() => {
        setPositionMillis((prev) => {
          const next = prev + 100;
          if (next >= estimatedDuration) {
            return estimatedDuration;
          }
          if (!hasReceivedBoundary.current) {
            const progress = next / estimatedDuration;
            const fallbackCharIndex = Math.floor(progress * charCount);
            setCurrentCharIndex((curr) => Math.max(curr, fallbackCharIndex));
          }
          return next;
        });
      }, 100);

      window.speechSynthesis.speak(utterance);
    };

    // Chrome: voices may not be ready on first call — wait for them
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
    } else {
      doSpeak();
    }
  };

  const startMobileSpeech = (text: string, rate: number) => {
    Speech.stop();
    setCurrentCharIndex(0);
    setPositionMillis(0);
    hasReceivedBoundary.current = false;
    playbackStartTime.current = Date.now();

    const charCount = text.length;
    setTotalChars(charCount);
    const estimatedDuration = (charCount / (rate * 4.5)) * 1000;
    setDurationMillis(estimatedDuration);

    Speech.speak(text, {
      language: "ko-KR",
      rate: rate,
      voice: selectedVoice || undefined,
      onStart: () => setIsPlaying(true),
      onDone: () => {
        setIsPlaying(false);
        setCurrentCharIndex(text.length);
        setPositionMillis(durationMillis);
        if (positionIntervalRef.current) {
          clearInterval(positionIntervalRef.current);
          positionIntervalRef.current = null;
        }
        setTimeout(() => {
          if (!isPlaying) {
            setCurrentCharIndex(0);
            setPositionMillis(0);
          }
        }, 1500);
      },
      onStopped: () => {
        setIsPlaying(false);
      },
      onBoundary: (event: any) => {
        hasReceivedBoundary.current = true;
        setCurrentCharIndex(event.charIndex);

        const elapsed = Date.now() - playbackStartTime.current;
        if (elapsed > 200 && event.charIndex > 0) {
          const actualCPMS = event.charIndex / elapsed;
          const newDuration = text.length / actualCPMS;
          setDurationMillis(newDuration);
          setPositionMillis(elapsed);
        }
      },
    });

    if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
    positionIntervalRef.current = setInterval(() => {
      setPositionMillis((prev) => {
        const next = prev + 100;
        if (next >= estimatedDuration) return prev;

        if (!hasReceivedBoundary.current) {
          const progress = next / estimatedDuration;
          const fallbackCharIndex = Math.floor(progress * charCount);
          setCurrentCharIndex((curr) => Math.max(curr, fallbackCharIndex));
        }
        return next;
      });
    }, 100);
  };

  const pauseWebSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
      positionIntervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const resumeWebSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
    const remaining = durationMillis - positionMillis;
    if (remaining > 0 && speechSynthesisRef.current) {
      const charCount = totalChars;
      positionIntervalRef.current = setInterval(() => {
        setPositionMillis((prev) => {
          const newPos = prev + 100;
          const startIdx = Math.floor(
            (positionMillis / durationMillis) * charCount,
          );
          const progress = (newPos - positionMillis) / remaining;
          setCurrentCharIndex(
            Math.floor(
              startIdx +
                progress * (remaining / (durationMillis / (remaining / 1000))),
            ),
          );
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
    if (Platform.OS === "web") {
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

    // if (Platform.OS !== "web") {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    } else {
      if (selectedPara) {
        startMobileSpeech(selectedPara.text, speechRate);
      }
    }
    return;
    // }
  };

  const fallbackToSpeech = (e?: any) => {
    console.warn("Fallback to native", e);
  };

  const stopAudio = async () => {
    setIsPlaying(false);
    setPositionMillis(0);
    setCurrentCharIndex(0);

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    } else {
      Speech.stop();
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    }
  };

  const seekForward = async () => {
    if (Platform.OS === "web" && webAudioRef.current) {
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
    if (Platform.OS === "web" && webAudioRef.current) {
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
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const checkResults = () => {
    setShowResult(true);
    stopAudio();
  };

  const resetAll = () => {
    setStep("source_selection");
    setSelectedPara(null);
    setSelectedYonseiTopic(null);
    setYonseiText("");
    setWordParts([]);
    setShowResult(false);
    stopAudio();
  };

  // Render sub-sections
  const renderSourceSelection = () => (
    <SourceSelection
      onSelectSample={() => setStep("sample_list")}
      onSelectManual={() => setStep("manual_input")}
    />
  );

  const renderSampleList = () => {
    const filteredTopics = YONSEI_TOPICS.filter((t) => t.level === selectedLevel);

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.tabContainerWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
            {["Sơ cấp 1", "Sơ cấp 2", "Trung cấp 1", "Trung cấp 2", "Cao cấp 1", "Cao cấp 2"].map((lvl) => {
              const isActive = selectedLevel === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  onPress={() => setSelectedLevel(lvl)}
                  style={[styles.levelTab, isActive && styles.levelTabActive]}
                >
                  <Text style={[styles.levelTabText, isActive && styles.levelTabTextActive]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={filteredTopics}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedYonseiTopic(item);
                setStep("yonsei_input");
              }}
              activeOpacity={0.7}
            >
              <Card variant="outlined" style={styles.yonseiTopicCard}>
                <View style={styles.yonseiTopicInfo}>
                  <Text style={styles.yonseiTopicTitle}>
                    {item.title} <Text style={styles.yonseiTopicVietnamese}>({item.vietnamese})</Text>
                  </Text>
                  <Text style={styles.yonseiTopicBook}>{item.book}</Text>
                </View>
                <View style={styles.yonseiPageBadge}>
                  <Text style={styles.yonseiPageText}>Trang {item.page}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderYonseiInput = () => {
    if (!selectedYonseiTopic) return null;

    return (
      <View style={styles.manualContainer}>
        <Card variant="elevated" style={styles.yonseiGuideCard}>
          <View style={styles.yonseiGuideHeader}>
            <View style={styles.yonseiGuideIconBox}>
              <Ionicons name="book" size={24} color={Colors.primary} />
            </View>
            <View style={styles.yonseiGuideInfo}>
              <Text style={styles.yonseiGuideTitle}>
                Bài học: {selectedYonseiTopic.title} ({selectedYonseiTopic.vietnamese})
              </Text>
              <Text style={styles.yonseiGuideSubtitle}>
                {selectedYonseiTopic.book} • TRANG {selectedYonseiTopic.page}
              </Text>
            </View>
          </View>
          <Text style={styles.yonseiGuideDesc}>
            Vui lòng dán nội dung bài học từ giáo trình vào ô bên dưới để bắt đầu rèn luyện.
          </Text>
        </Card>

        <View style={styles.manualInputHeader}>
          <Text style={styles.manualInputLabel}>NỘI DUNG BÀI HỌC</Text>
          <TouchableOpacity onPress={() => setYonseiText("")} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.primary} />
            <Text style={styles.clearBtnText}>XÓA SẠCH</Text>
          </TouchableOpacity>
        </View>

        <Card variant="default" style={styles.inputCard}>
          <TextInput
            style={styles.manualTextInput}
            placeholder="Dán văn bản bài học tại đây..."
            multiline
            value={yonseiText}
            onChangeText={setYonseiText}
            textAlignVertical="top"
          />
        </Card>

        <Button
          title="BẮT ĐẦU BÀI HỌC"
          onPress={() =>
            processTextForPractice(yonseiText, `${selectedYonseiTopic.title} (Trang ${selectedYonseiTopic.page})`)
          }
          fullWidth
          size="lg"
          disabled={yonseiText.trim().length < 10}
          style={styles.startBtn}
        />
      </View>
    );
  };

  const renderManualInput = () => (
    <View style={styles.manualContainer}>
      <View style={styles.manualInputHeader}>
        <Text style={styles.manualInputLabel}>TỰ NHẬP VĂN BẢN</Text>
        <TouchableOpacity onPress={() => setManualText("")} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={16} color={Colors.primary} />
          <Text style={styles.clearBtnText}>XÓA SẠCH</Text>
        </TouchableOpacity>
      </View>

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
        title="BẮT ĐẦU BÀI HỌC"
        onPress={() =>
          processTextForPractice(manualText, manualTitle || "Bài tự nhập")
        }
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
              onPress={() =>
                setBlankCount(
                  Math.min(selectedPara?.wordCount || 10, blankCount + 1),
                )
              }
            >
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.blankSliderContainer}>
            <Text style={styles.blankSliderLabel}>
              Tỷ lệ:{" "}
              {Math.round((blankCount / (selectedPara?.wordCount || 1)) * 100)}%
            </Text>
            <View style={styles.blankSliderTrack}>
              <View
                style={[
                  styles.blankSliderFill,
                  {
                    width: `${(blankCount / (selectedPara?.wordCount || 1)) * 100}%`,
                  },
                ]}
              />
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
                  speechRate === rate && styles.ratioBtnActive,
                ]}
                onPress={() => setSpeechRate(rate)}
              >
                <Text
                  style={[
                    styles.ratioBtnText,
                    speechRate === rate && styles.ratioBtnTextActive,
                  ]}
                >
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

  const renderPractice = () => {
    if (showResult) {
      const totalBlanks = wordParts.filter((p) => p.isBlank).length;
      const correctCount = wordParts.filter(
        (p) =>
          p.isBlank &&
          p.userInput.trim().toLowerCase() === p.original.toLowerCase(),
      ).length;
      const score = Math.round((correctCount / (totalBlanks || 1)) * 100);

      return (
        <DictationResults
          score={score}
          totalBlanks={totalBlanks}
          correctCount={correctCount}
          onRestart={startPractice}
          onExit={resetAll}
          wordParts={wordParts}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DictationPlayer
          title={selectedPara?.title}
          isPlaying={isPlaying}
          positionMillis={positionMillis}
          durationMillis={durationMillis}
          speechRate={speechRate}
          currentCharIndex={currentCharIndex}
          totalChars={totalChars}
          waveformHeights={waveformHeights}
          onTogglePlayPause={togglePlayPause}
          onSeekForward={seekForward}
          onSeekBackward={seekBackward}
          onCycleSpeechRate={cycleSpeechRate}
        />

        <View style={styles.practiceSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="headset" size={20} color={Colors.primary} />
            <Text style={styles.sectionLabel}>Điền vào chỗ trống</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>
                {
                  wordParts.filter(
                    (p) =>
                      p.isBlank &&
                      p.userInput.trim().toLowerCase() ===
                        p.original.toLowerCase(),
                  ).length
                }
              </Text>
              <Text style={styles.statsLabel}>Đúng</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>
                {wordParts.filter((p) => p.isBlank).length}
              </Text>
              <Text style={styles.statsLabel}>Tổng ẩn</Text>
            </View>
          </View>

          <Card variant="default" style={styles.clozeContainer}>
            <View style={styles.clozeGrid}>
              {wordParts.map((part, index) => {
                const isActive =
                  isPlaying &&
                  part.charStart !== undefined &&
                  part.charEnd !== undefined &&
                  currentCharIndex >= part.charStart &&
                  currentCharIndex < part.charEnd + 2;

                const getFeedbackStyle = () => {
                  const input = part.userInput.trim();
                  if (!input) return null;
                  const correct = part.original;
                  if (input.toLowerCase() === correct.toLowerCase()) {
                    return styles.wordCorrect;
                  }
                  if (correct.toLowerCase().startsWith(input.toLowerCase())) {
                    return { borderColor: '#3B82F6', color: '#3B82F6', backgroundColor: '#EFF6FF' };
                  }
                  return styles.wordWrong;
                };

                return (
                  <View
                    key={part.id}
                    style={[styles.wordBox, isActive && styles.activeWordBox]}
                  >
                    {part.isBlank ? (
                      <View>
                        <TextInput
                          style={[
                            styles.wordInput,
                            isActive && styles.activeWordInput,
                            getFeedbackStyle(),
                            isPlaying && { opacity: 0.5 }
                          ]}
                          value={part.userInput}
                          onChangeText={(val) => {
                            const updated = [...wordParts];
                            updated[index].userInput = val;
                            setWordParts(updated);
                          }}
                          autoCorrect={false}
                          autoCapitalize="none"
                          editable={!isPlaying}
                          placeholder={isPlaying ? "🔒" : ""}
                          placeholderTextColor={Colors.textTertiary}
                        />
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.plainText,
                          isActive && styles.activePlainText,
                        ]}
                      >
                        {part.display}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        <Button
          title="Kiểm tra bài"
          onPress={checkResults}
          fullWidth
          size="lg"
          style={styles.mainActionBtn}
        />
      </ScrollView>
    );
  };

  const handleBack = () => {
    if (step === "source_selection") {
      router.back();
    } else if (step === "yonsei_input") {
      setStep("sample_list");
    } else if (step === "sample_list" || step === "manual_input") {
      setStep("source_selection");
    } else if (step === "setup") {
      if (selectedYonseiTopic) {
        setStep("yonsei_input");
      } else {
        setStep("manual_input");
      }
    } else {
      resetAll();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ghi nhớ & điền từ</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {availableVoices.length > 1 && (
              <TouchableOpacity style={styles.infoBtn} onPress={() => setShowVoiceSettings(true)}>
                <Ionicons name="mic" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.infoBtn} onPress={resetAll}>
              <Ionicons name="refresh" size={22} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepIndicator}>
          <Badge
            label={
              step === "source_selection"
                ? "Bước 1: Chọn nguồn"
                : step === "practice"
                  ? "Bước 2: Thực hành"
                  : "Thiết lập văn bản"
            }
            variant="info"
          />
        </View>

        {step === "source_selection" && renderSourceSelection()}
        {step === "sample_list" && renderSampleList()}
        {step === "yonsei_input" && renderYonseiInput()}
        {step === "manual_input" && renderManualInput()}
        {step === "setup" && renderSetup()}
        {step === "practice" && renderPractice()}

        <Modal
          visible={showVoiceSettings}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowVoiceSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.voiceSettingsCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Giọng đọc Tiếng Hàn</Text>
                <TouchableOpacity onPress={() => setShowVoiceSettings(false)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>Chọn giọng đọc mong muốn của bạn:</Text>
              
              <ScrollView style={styles.voicesList} showsVerticalScrollIndicator={false}>
                {availableVoices.map((v) => {
                  const isSelected = selectedVoice === v.identifier;
                  return (
                    <TouchableOpacity
                      key={v.identifier}
                      style={[styles.voiceItem, isSelected && styles.voiceItemActive]}
                      onPress={() => {
                        setSelectedVoice(v.identifier);
                        setShowVoiceSettings(false);
                      }}
                    >
                      <Ionicons 
                        name={(v.quality as string) === 'enhanced' ? 'sparkles' : 'person-outline'} 
                        size={18} 
                        color={isSelected ? Colors.primary : Colors.textSecondary} 
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.voiceName, isSelected && styles.voiceNameActive]}>
                          {v.name.replace('ko-kr', '').replace('ko-KR', '')}
                        </Text>
                        <Text style={styles.voiceDetails}>
                          Chất lượng: {(v.quality as string) === 'enhanced' ? 'Nâng cao ✨' : 'Tiêu chuẩn'}
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  voiceSettingsCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "70%",
    ...Platform.select({
      web: { boxShadow: "0px -4px 12px rgba(0,0,0,0.1)" } as any,
      default: Shadows.lg,
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  voicesList: {
    marginBottom: 16,
  },
  voiceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: Radius.xl,
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  voiceItemActive: {
    backgroundColor: "#FFF0F3",
    borderColor: Colors.primary,
  },
  voiceName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  voiceNameActive: {
    color: Colors.primary,
  },
  voiceDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#FAF9FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.05)" } as any,
      default: Shadows.sm,
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
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndicator: {
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  sourceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 16,
    borderRadius: Radius.xl,
  },
  sourceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    borderBottomColor: "#EEE",
    paddingBottom: 8,
  },
  manualTextInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  tabContainerWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    backgroundColor: '#FAF9FB',
  },
  tabScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  levelTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  levelTabActive: {
    backgroundColor: '#EF5FA0',
    borderColor: '#EF5FA0',
  },
  levelTabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semibold,
  },
  levelTabTextActive: {
    color: '#FFF',
    fontWeight: Typography.weights.bold,
  },
  yonseiTopicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: Radius.lg,
    backgroundColor: '#FFF',
  },
  yonseiTopicInfo: {
    flex: 1,
    marginRight: 12,
  },
  yonseiTopicTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  yonseiTopicVietnamese: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  yonseiTopicBook: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  yonseiPageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    backgroundColor: '#FFF0F3',
  },
  yonseiPageText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  yonseiGuideCard: {
    padding: 18,
    borderRadius: Radius.xl,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
    marginBottom: 20,
  },
  yonseiGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  yonseiGuideIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  yonseiGuideInfo: {
    flex: 1,
  },
  yonseiGuideTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: '#111827',
  },
  yonseiGuideSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  yonseiGuideDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  manualInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  manualInputLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  startBtn: {
    marginTop: "auto",
  },
  setupCard: {
    padding: 24,
    borderRadius: Radius["3xl"],
    marginTop: 10,
  },
  setupHeader: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 20,
  },
  blankCountBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  blankCountDisplay: {
    alignItems: "center",
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
    alignItems: "center",
  },
  blankSliderLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  blankSliderTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  blankSliderFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  ratioContainer: {
    flexDirection: "row",
    gap: 12,
  },
  ratioBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
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
    alignItems: "center",
  },
  ratioSliderLabel: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 12,
  },
  ratioSliderTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  ratioSliderFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  startPracticeBtn: {
    marginTop: 8,
  },
  modernPlayerFrame: {
    padding: 24,
    borderRadius: Radius["3xl"],
    backgroundColor: "#FFF5F9",
    marginTop: 10,
    ...Platform.select({
      web: { boxShadow: "0px 6px 12px rgba(239, 95, 160, 0.08)" } as any,
      default: Shadows.md,
    }),
  },
  playerTitleText: {
    fontSize: 18,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#FBCFE8",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#EC4899",
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: "#F472B6",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  emptySpace: {
    width: 50,
  },
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  playPauseLargeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EC4899",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0px 8px 24px rgba(236, 72, 153, 0.4)" } as any,
      default: { ...Shadows.lg, shadowColor: "#EC4899" },
    }),
  },
  seekBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  seekBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(236, 72, 153, 0.15)" } as any,
      default: Shadows.sm,
    }),
  },
  seekSubText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: "#EC4899",
    marginTop: 6,
  },
  speedBtnPlayer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(236, 72, 153, 0.15)" } as any,
      default: Shadows.sm,
    }),
  },
  speedBtnInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  speedTextPlayer: {
    fontSize: 14,
    fontWeight: Typography.weights.extrabold,
    color: "#EC4899",
  },
  waveformContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  waveformBars: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: "100%",
  },
  waveformBar: {
    width: 4,
    backgroundColor: "#EC4899",
    borderRadius: 2,
  },
  practiceSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 20,
  },
  statsItem: {
    alignItems: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  wordBox: {
    marginRight: 6,
    marginVertical: 4,
    borderRadius: 4,
  },
  activeWordBox: {
    backgroundColor: "#FFF1F2",
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
    minWidth: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 36,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  activeWordInput: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "#FFF1F2",
  },
  wordCorrect: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
    color: "#10B981",
  },
  wordWrong: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    color: "#EF4444",
  },
  answerText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: Typography.weights.bold,
    marginTop: 2,
    textAlign: "center",
  },
  mainActionBtn: {
    marginBottom: 20,
  },
});
