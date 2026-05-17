import { getDb } from '../client';

export interface DailyActivity {
  date: string;
  day: string;
  minutes: number;
  xp: number;
}

export interface UserStats {
  xp: number;
  streak: number;
  totalFlashcards: number;
  masteredFlashcards: number;
  totalLessons: number;
  completedLessons: number;
  vocabularyProgress: number;
  grammarProgress: number;
  weeklyActivity: DailyActivity[];
  totalMinutes: number;
  avgExamScore: number;
  totalExams: number;
  avgDictationScore: number;
  totalDictations: number;
  wordsLearnedToday: number;
}

export const statsRepo = {
  async getStats(): Promise<UserStats> {
    const db = await getDb();
    
    // Get user general stats
    const user = await db.getFirstAsync<{ xp: number, streak: number }>('SELECT xp, streak FROM users LIMIT 1');
    
    // Get Flashcard stats
    const flashcardStats = await db.getFirstAsync<{ total: number, mastered: number }>(
      'SELECT COUNT(*) as total, SUM(mastered) as mastered FROM flashcards'
    );
    
    // Get Lesson/Course stats
    const lessonStats = await db.getFirstAsync<{ total: number, completed: number }>(
      'SELECT COUNT(*) as total, SUM(completed) as completed FROM lessons'
    );

    // Get Daily Activity for the last 7 days
    const dailyRows = await db.getAllAsync<{ date: string, minutes: number, xp: number }>(
      'SELECT date, minutes, xp FROM daily_stats ORDER BY date DESC LIMIT 7'
    );

    // Fetch average exam scores
    const examSummary = await db.getFirstAsync<{ avg_score: number, total: number }>(
      'SELECT AVG(score) as avg_score, COUNT(*) as total FROM exam_history'
    );

    // Fetch average dictation scores
    const dictationSummary = await db.getFirstAsync<{ avg_score: number, total: number }>(
      'SELECT AVG(accuracy_score) as avg_score, COUNT(*) as total FROM dictation_history'
    );

    // Fetch words learned today
    const today = new Date().toISOString().split('T')[0];
    const learnedSummary = await db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(DISTINCT card_id) as total FROM flashcard_history WHERE date = ? AND is_correct = 1',
      [today]
    );

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const weeklyActivity: DailyActivity[] = [];
    
    // Fill in last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const row = dailyRows.find(r => r.date === dateStr);
      weeklyActivity.push({
        date: dateStr,
        day: days[d.getDay()],
        minutes: row?.minutes || 0,
        xp: row?.xp || 0
      });
    }

    const totalMinutes = weeklyActivity.reduce((acc, curr) => acc + curr.minutes, 0);

    const totalFlashcards = flashcardStats?.total || 0;
    const masteredFlashcards = flashcardStats?.mastered || 0;
    const totalLessons = lessonStats?.total || 0;
    const completedLessons = lessonStats?.completed || 0;

    const avgExamScore = Math.round(examSummary?.avg_score || 0);
    const totalExams = examSummary?.total || 0;
    const avgDictationScore = Math.round(dictationSummary?.avg_score || 0);
    const totalDictations = dictationSummary?.total || 0;
    const wordsLearnedToday = learnedSummary?.total || 0;

    return {
      xp: user?.xp || 0,
      streak: user?.streak || 0,
      totalFlashcards,
      masteredFlashcards,
      totalLessons,
      completedLessons,
      vocabularyProgress: totalFlashcards > 0 ? masteredFlashcards / totalFlashcards : 0,
      grammarProgress: totalLessons > 0 ? completedLessons / totalLessons : 0,
      weeklyActivity,
      totalMinutes,
      avgExamScore,
      totalExams,
      avgDictationScore,
      totalDictations,
      wordsLearnedToday,
    };
  },

  async logActivity(minutes: number, xp: number, wordsLearned: number = 0): Promise<void> {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    await db.runAsync(
      `INSERT INTO daily_stats (date, minutes, xp, words_learned) VALUES (?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET minutes = minutes + ?, xp = xp + ?, words_learned = words_learned + ?`,
      [today, minutes, xp, wordsLearned, minutes, xp, wordsLearned]
    );
  },

  async logDictationSession(accuracyScore: number, totalBlanks: number, correctBlanks: number): Promise<void> {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const id = `dict-${Date.now()}`;
    await db.runAsync(
      'INSERT INTO dictation_history (id, date, accuracy_score, total_blanks, correct_blanks) VALUES (?, ?, ?, ?, ?)',
      [id, today, accuracyScore, totalBlanks, correctBlanks]
    );
    await this.logActivity(10, 15);
  },

  async logExamSession(score: number, correctAnswers: number, totalQuestions: number, timeTaken: string): Promise<void> {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const id = `exam-${Date.now()}`;
    await db.runAsync(
      'INSERT INTO exam_history (id, date, score, correct_answers, total_questions, time_taken) VALUES (?, ?, ?, ?, ?, ?)',
      [id, today, score, correctAnswers, totalQuestions, timeTaken]
    );
    await this.logActivity(20, 50);
  },

  async logFlashcardReview(cardId: string, isCorrect: boolean): Promise<void> {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const id = `fc-rev-${Date.now()}-${cardId}`;
    await db.runAsync(
      'INSERT INTO flashcard_history (id, date, card_id, is_correct) VALUES (?, ?, ?, ?)',
      [id, today, cardId, isCorrect ? 1 : 0]
    );
    await this.logActivity(0.2, isCorrect ? 2 : 1, isCorrect ? 1 : 0);
  }
};
