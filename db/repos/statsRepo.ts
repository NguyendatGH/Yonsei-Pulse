import { getDb } from '../client';

export interface UserStats {
  xp: number;
  streak: number;
  totalFlashcards: number;
  masteredFlashcards: number;
  totalLessons: number;
  completedLessons: number;
  vocabularyProgress: number;
  grammarProgress: number;
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
    };
  }
};
