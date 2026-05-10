/**
 * Mock data for UI preview — Korean Language Learning App
 * All data is static for UI development; will be replaced with API calls later.
 */

// ─── User Profile ────────────────────────────────────────────
export const MOCK_USER = {
  id: '1',
  name: 'Linh',
  email: 'linh@example.com',
  avatar: null,
  level: 'Sơ cấp',
  xp: 1240,
  streak: 12,
  joinDate: '2025-01-15',
  todayWords: 13,
  totalWords: 20,
  totalStudyMinutes: 2400,
  completedLessons: 24,
  badges: [
    { id: '1', name: 'Người mới', icon: '🌱', earned: true },
    { id: '2', name: 'Chuỗi 7 ngày', icon: '🔥', earned: true },
    { id: '3', name: 'Chuỗi 30 ngày', icon: '💎', earned: false },
    { id: '4', name: '100 từ vựng', icon: '📚', earned: true },
    { id: '5', name: 'Nghe giỏi', icon: '🎧', earned: false },
    { id: '6', name: 'Hoàn hảo', icon: '⭐', earned: false },
  ],
} as const;

// ─── Daily Stats ─────────────────────────────────────────────
export const MOCK_DAILY_STATS = {
  dailyProgress: 0.65,
  todayWords: 13,
  totalWords: 20,
  streak: 12,
  xp: 1240,
  weeklyData: [
    { day: 'T2', minutes: 25, words: 15 },
    { day: 'T3', minutes: 30, words: 20 },
    { day: 'T4', minutes: 20, words: 12 },
    { day: 'T5', minutes: 35, words: 22 },
    { day: 'T6', minutes: 15, words: 10 },
    { day: 'T7', minutes: 40, words: 25 },
    { day: 'CN', minutes: 0, words: 0 },
  ],
  monthlyData: {
    totalMinutes: 720,
    totalWords: 350,
    averageScore: 82,
    lessonsCompleted: 12,
  },
} as const;

// ─── Quick Access Actions ────────────────────────────────────
export const MOCK_QUICK_ACTIONS = [
  {
    id: 'srs',
    title: 'Ôn tập SRS',
    icon: 'calendar',
    color: '#8B5CF6',
    route: '/practice/srs-review',
  },
  {
    id: 'flashcards',
    title: 'Từ vựng',
    icon: 'copy',
    color: '#EF5FA0',
    route: '/practice/flashcards',
  },
  { id: 'listening', title: 'Luyện nghe', icon: 'headset', color: '#60A5FA', route: '/(tabs)/library?tab=listening' },
  { id: 'grammar', title: 'Ngữ pháp', icon: 'book', color: '#34D399', route: '/(tabs)/library?tab=courses' },
  { id: 'custom', title: 'Tự soạn bài', icon: 'create', color: '#8B5CF6', route: '/practice/custom-dictation' },
  { id: 'exam', title: 'Thi thử', icon: 'medal', color: '#FBBF24', route: '/practice/exam' },
] as const;

// ─── Yonsei Textbook Courses ─────────────────────────────────
export const MOCK_COURSES = [
  {
    id: '1',
    title: 'Yonsei Tiếng Hàn 1',
    level: 'Sơ cấp',
    totalLessons: 10,
    completedLessons: 10,
    progress: 1.0,
    locked: false,
    color: '#34D399',
    description: 'Bảng chữ cái Hangul, chào hỏi cơ bản, số đếm',
  },
  {
    id: '2',
    title: 'Yonsei Tiếng Hàn 2',
    level: 'Sơ cấp',
    totalLessons: 10,
    completedLessons: 3,
    progress: 0.3,
    locked: false,
    color: '#2b8cee',
    currentLesson: 4,
    description: 'Ngữ pháp cơ bản, hội thoại hàng ngày',
  },
  {
    id: '3',
    title: 'Yonsei Tiếng Hàn 3',
    level: 'Trung cấp',
    totalLessons: 12,
    completedLessons: 0,
    progress: 0,
    locked: true,
    color: '#9CA3AF',
    description: 'Ngữ pháp nâng cao, đọc hiểu văn bản',
  },
  {
    id: '4',
    title: 'Yonsei Tiếng Hàn 4',
    level: 'Trung cấp',
    totalLessons: 12,
    completedLessons: 0,
    progress: 0,
    locked: true,
    color: '#9CA3AF',
    description: 'Viết luận, thảo luận chủ đề xã hội',
  },
] as const;

// ─── Lessons in a Course ─────────────────────────────────────
export const MOCK_LESSONS = [
  // Lessons for Course 1 (Yonsei 1)
  { id: 'l1', course_id: '1', title: 'Bài 1: Giới thiệu bản thân', duration: '15 phút', completed: true, type: 'vocabulary' as const },
  { id: 'l2', course_id: '1', title: 'Bài 2: Chào hỏi & Làm quen', duration: '20 phút', completed: true, type: 'grammar' as const },
  { id: 'l3', course_id: '1', title: 'Bài 3: Gia đình & Bạn bè', duration: '25 phút', completed: true, type: 'vocabulary' as const },
  { id: 'l4', course_id: '1', title: 'Bài 4: Mua sắm tại chợ', duration: '20 phút', completed: false, type: 'mixed' as const, current: true },
  { id: 'l5', course_id: '1', title: 'Bài 5: Đi nhà hàng xá', duration: '20 phút', completed: false, type: 'vocabulary' as const },
  { id: 'l6', course_id: '1', title: 'Bài 6: Phương tiện giao thông', duration: '25 phút', completed: false, type: 'grammar' as const },
  { id: 'l7', course_id: '1', title: 'Bài 7: Thời tiết & Bốn mùa', duration: '15 phút', completed: false, type: 'vocabulary' as const },
  { id: 'l8', course_id: '1', title: 'Bài 8: Sở thích & Thời gian rảnh', duration: '30 phút', completed: false, type: 'mixed' as const },
  
  // Lessons for Course 2 (Yonsei 2)
  { id: 'l2-1', course_id: '2', title: 'Bài 1: Cuộc sống trường học', duration: '20 phút', completed: false, type: 'vocabulary' as const },
  { id: 'l2-2', course_id: '2', title: 'Bài 2: Đặt cuộc hẹn', duration: '20 phút', completed: false, type: 'grammar' as const },
  { id: 'l2-3', course_id: '2', title: 'Bài 3: Tìm đường & Chỉ dẫn', duration: '30 phút', completed: false, type: 'mixed' as const },
] as const;

// ─── Flashcard Sets ──────────────────────────────────────────
export const MOCK_FLASHCARD_SETS = [
  {
    id: 'fs1',
    title: 'Thức ăn & Đồ uống',
    emoji: '🍜',
    totalCards: 30,
    mastered: 22,
    color: '#FFB5C2',
    category: 'Đời sống',
  },
  {
    id: 'fs2',
    title: 'Du lịch & Di chuyển',
    emoji: '✈️',
    totalCards: 25,
    mastered: 15,
    color: '#60A5FA',
    category: 'Du lịch',
  },
  {
    id: 'fs3',
    title: 'Công việc & Văn phòng',
    emoji: '💼',
    totalCards: 20,
    mastered: 8,
    color: '#34D399',
    category: 'Công việc',
  },
  {
    id: 'fs4',
    title: 'Số đếm & Thời gian',
    emoji: '🔢',
    totalCards: 35,
    mastered: 30,
    color: '#FBBF24',
    category: 'Cơ bản',
  },
  {
    id: 'fs5',
    title: 'Cảm xúc & Tính cách',
    emoji: '😊',
    totalCards: 20,
    mastered: 5,
    color: '#A78BFA',
    category: 'Đời sống',
  },
  {
    id: 'fs6',
    title: 'Gia đình & Bản thân',
    emoji: '👨‍👩‍👧‍👦',
    totalCards: 15,
    mastered: 0,
    color: '#F472B6',
    category: 'Cơ bản',
  },
] as const;

// ─── Individual Flashcards ───────────────────────────────────
export const MOCK_FLASHCARDS = [
  { id: 'fc1', korean: '사과', vietnamese: 'Quả táo', pronunciation: 'sa-gwa', example: '사과를 먹어요', exampleVi: 'Tôi ăn táo', mastered: true },
  { id: 'fc2', korean: '물', vietnamese: 'Nước', pronunciation: 'mul', example: '물을 마셔요', exampleVi: 'Tôi uống nước', mastered: true },
  { id: 'fc3', korean: '밥', vietnamese: 'Cơm', pronunciation: 'bap', example: '밥을 먹어요', exampleVi: 'Tôi ăn cơm', mastered: false },
  { id: 'fc4', korean: '커피', vietnamese: 'Cà phê', pronunciation: 'keo-pi', example: '커피를 마셔요', exampleVi: 'Tôi uống cà phê', mastered: false },
  { id: 'fc5', korean: '김치', vietnamese: 'Kim chi', pronunciation: 'gim-chi', example: '김치를 좋아해요', exampleVi: 'Tôi thích kim chi', mastered: true },
  { id: 'fc6', korean: '학교', vietnamese: 'Trường học', pronunciation: 'hak-gyo', example: '학교에 가요', exampleVi: 'Tôi đi đến trường', mastered: false },
  { id: 'fc7', korean: '선생님', vietnamese: 'Giáo viên', pronunciation: 'seon-saeng-nim', example: '선생님을 만나요', exampleVi: 'Tôi gặp giáo viên', mastered: false },
  { id: 'fc8', korean: '친구', vietnamese: 'Bạn bè', pronunciation: 'chin-gu', example: '친구와 놀아요', exampleVi: 'Tôi chơi cùng bạn', mastered: false },
  { id: 'fc9', korean: '공부', vietnamese: 'Học tập', pronunciation: 'gong-bu', example: '도서관에서 공부해요', exampleVi: 'Tôi học ở thư viện', mastered: false },
  { id: 'fc10', korean: '책', vietnamese: 'Sách', pronunciation: 'chaek', example: '책을 읽어요', exampleVi: 'Tôi đọc sách', mastered: false },
] as const;

export const MOCK_GRAMMAR = [
  {
    id: 'g1',
    title: 'N + 입니다',
    description: 'Dùng để giới thiệu danh từ, tương đương "là" trong tiếng Việt.',
    example: '저는 학생입니다.',
    explanation: 'Dùng trong tình huống trang trọng, lịch sự.',
  },
  {
    id: 'g2',
    title: 'N + 이/가',
    description: 'Tiểu từ chủ ngữ.',
    example: '날씨가 좋아요.',
    explanation: 'Dùng để nhấn mạnh chủ ngữ trong câu.',
  },
  {
    id: 'g3',
    title: 'V + 아/어/여요',
    description: 'Đuôi câu kết thúc thì hiện tại (lịch sự).',
    example: '밥을 먹어요.',
    explanation: 'Cách chia phụ thuộc vào nguyên âm cuối của gốc động từ.',
  },
] as const;

// ─── Listening Practice Paragraphs ───────────────────────────
export const MOCK_LISTENING_PARAGRAPHS = [
  {
    id: 'lp1',
    title: 'Giới thiệu bản thân',
    korean: '안녕하세요. 저는 ___ 입니다. 한국어를 ___ 있어요. 저는 베트남 ___ 왔어요.',
    fullKorean: '안녕하세요. 저는 린 입니다. 한국어를 공부하고 있어요. 저는 베트남에서 왔어요.',
    vietnamese: 'Xin chào. Tôi là Linh. Tôi đang học tiếng Hàn. Tôi đến từ Việt Nam.',
    hiddenWords: ['린', '공부하고', '에서'],
    difficulty: 'easy' as const,
    duration: '2:30',
    completed: true,
    score: 100,
    color: '#10B981',
  },
  {
    id: 'lp2',
    title: 'Đi mua sắm',
    korean: '시장에서 ___ 을 샀어요. 가격이 ___ 원이에요. 정말 ___.',
    fullKorean: '시장에서 과일을 샀어요. 가격이 오천 원이에요. 정말 싸요.',
    vietnamese: 'Tôi đã mua trái cây ở chợ. Giá là 5000 won. Thật rẻ.',
    hiddenWords: ['과일', '오천', '싸요'],
    difficulty: 'medium' as const,
    duration: '3:15',
    completed: false,
    score: null,
    color: '#3B82F6',
  },
  {
    id: 'lp3',
    title: 'Thời tiết hôm nay',
    korean: '오늘 ___ 가 좋아요. 하늘이 ___. ___ 도 시원해요.',
    fullKorean: '오늘 날씨가 좋아요. 하늘이 맑아요. 바람도 시원해요.',
    vietnamese: 'Hôm nay thời tiết đẹp. Bầu trời trong xanh. Gió cũng mát.',
    hiddenWords: ['날씨', '맑아요', '바람'],
    difficulty: 'easy' as const,
    duration: '2:00',
    completed: false,
    score: null,
    color: '#10B981',
  },
  {
    id: 'lp4',
    title: 'Kinh tế Hàn Quốc',
    korean: '한국 ___ 는 ___ 발전을 ___ 있습니다.',
    fullKorean: '한국 경제는 빠르게 발전을 하고 있습니다.',
    vietnamese: 'Kinh tế Hàn Quốc đang phát triển nhanh chóng.',
    hiddenWords: ['경제', '빠르게', '하고'],
    difficulty: 'hard' as const,
    duration: '5:45',
    completed: false,
    score: null,
    color: '#EF4444',
  },
] as const;

// ─── Mock Exam ───────────────────────────────────────────────
export const MOCK_EXAM = {
  id: 'exam1',
  title: 'Thi thử TOPIK I',
  totalQuestions: 20,
  duration: '30 phút',
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice' as const,
      question: '"감사합니다" có nghĩa là gì?',
      options: ['Xin lỗi', 'Cảm ơn', 'Xin chào', 'Tạm biệt'],
      correctAnswer: 1,
    },
    {
      id: 'q2',
      type: 'multiple_choice' as const,
      question: 'Chọn từ đúng: 저는 학생 ___.',
      options: ['이에요', '예요', '입니다', 'Cả A và C'],
      correctAnswer: 3,
    },
    {
      id: 'q3',
      type: 'multiple_choice' as const,
      question: '"학교" có nghĩa là gì?',
      options: ['Bệnh viện', 'Trường học', 'Ngân hàng', 'Nhà hàng'],
      correctAnswer: 1,
    },
    {
      id: 'q4',
      type: 'fill_blank' as const,
      question: 'Điền vào chỗ trống: 오늘 ___ 가 좋아요.',
      correctAnswer: '날씨',
    },
  ],
  passingScore: 70,
} as const;

// ─── Mock Exam Result ────────────────────────────────────────
export const MOCK_EXAM_RESULT = {
  score: 85,
  totalQuestions: 20,
  correctAnswers: 17,
  wrongAnswers: 3,
  timeTaken: '22:15',
  passed: true,
  categories: [
    { name: 'Từ vựng', score: 90, total: 8, correct: 7 },
    { name: 'Ngữ pháp', score: 83, total: 6, correct: 5 },
    { name: 'Nghe hiểu', score: 80, total: 6, correct: 5 },
  ],
} as const;

// ─── Culture Tips ────────────────────────────────────────────
export const MOCK_CULTURE_TIPS = [
  {
    id: '1',
    title: 'Ẩm thực đường phố Myeongdong',
    description: 'Khám phá thiên đường ẩm thực với Teokbokki và Gimbap tại trung tâm Seoul.',
  },
  {
    id: '2',
    title: 'Văn hóa cúi chào',
    description: 'Tìm hiểu các cấp độ cúi chào thể hiện sự kính trọng trong xã hội Hàn Quốc.',
  },
  {
    id: '3',
    title: 'Trang phục Hanbok',
    description: 'Nét đẹp truyền thống của trang phục Hàn Quốc và ý nghĩa của các màu sắc.',
  },
  {
    id: '4',
    title: 'Lễ hội bùn Boryeong',
    description: 'Một trong những lễ hội mùa hè sôi động nhất thu hút hàng triệu khách du lịch.',
  },
  {
    id: '5',
    title: 'Nghi thức uống trà',
    description: 'Sự tĩnh lặng và tinh tế trong nghệ thuật trà đạo truyền thống Hàn Quốc.',
  },
] as const;

export const MOCK_CULTURE_TIP = MOCK_CULTURE_TIPS[0];

// ─── Statistics Extended ─────────────────────────────────────
export const MOCK_STATISTICS = {
  totalStudyDays: 45,
  longestStreak: 15,
  currentStreak: 12,
  totalXP: 1240,
  totalWordsLearned: 230,
  totalListeningMinutes: 180,
  totalLessonsCompleted: 24,
  averageScore: 82,
  weeklyStudyMinutes: [25, 30, 20, 35, 15, 40, 0],
  vocabularyByCategory: [
    { category: 'Đời sống', count: 80 },
    { category: 'Du lịch', count: 45 },
    { category: 'Công việc', count: 35 },
    { category: 'Cơ bản', count: 50 },
    { category: 'Cảm xúc', count: 20 },
  ],
  recentActivities: [
    { type: 'flashcard', title: 'Hoàn thành bộ "Thức ăn"', time: '2 giờ trước', xp: 50 },
    { type: 'lesson', title: 'Bài 3: Gia đình', time: '5 giờ trước', xp: 80 },
    { type: 'listening', title: 'Luyện nghe: Giới thiệu', time: 'Hôm qua', xp: 30 },
    { type: 'exam', title: 'Thi thử TOPIK I', time: '2 ngày trước', xp: 100 },
  ],
} as const;

// ─── Lesson Setup Options ────────────────────────────────────
export const MOCK_LESSON_SETUP = {
  difficultyLevels: [
    { id: 'easy', label: 'Dễ', description: 'Ẩn 2-3 từ', icon: 'leaf' },
    { id: 'medium', label: 'Trung bình', description: 'Ẩn 4-5 từ', icon: 'flame' },
    { id: 'hard', label: 'Khó', description: 'Ẩn 6+ từ', icon: 'rocket' },
  ],
  wordTypes: [
    { id: 'noun', label: 'Danh từ', selected: true },
    { id: 'verb', label: 'Động từ', selected: true },
    { id: 'adjective', label: 'Tính từ', selected: false },
    { id: 'adverb', label: 'Trạng từ', selected: false },
  ],
  practiceMode: [
    { id: 'listen_fill', label: 'Nghe & Điền', icon: 'headset' },
    { id: 'read_fill', label: 'Đọc & Điền', icon: 'book' },
    { id: 'mixed', label: 'Kết hợp', icon: 'shuffle' },
  ],
} as const;
