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

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const weeklyActivity: DailyActivity[] = [];
    
    // Fill in last 7 days (simplified for now)
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
    };
  },

  async logActivity(minutes: number, xp: number): Promise<void> {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    await db.runAsync(
      `INSERT INTO daily_stats (date, minutes, xp) VALUES (?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET minutes = minutes + ?, xp = xp + ?`,
      [today, minutes, xp, minutes, xp]
    );
  }
};
