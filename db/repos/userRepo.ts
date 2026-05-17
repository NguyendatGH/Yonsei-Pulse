import { getDb } from '../client';

export interface User {
  id: string;
  name: string;
  email: string | null;
  password?: string | null;
  avatar: string | null;
  level: string;
  xp: number;
  streak: number;
  joinDate: string;
  todayWords: number;
  totalWords: number;
  totalStudyMinutes: number;
  completedLessons: number;
  completedPractices: number;
  lastStudyDate: string | null;
}

export const userRepo = {
  async getCurrentUser(): Promise<User | null> {
    const db = await getDb();
    return await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
  },

  async verifyUser(email: string, passwordHash: string): Promise<User | null> {
    const db = await getDb();
    return await db.getFirstAsync<User>('SELECT * FROM users WHERE email = ? AND password = ?', [email, passwordHash]);
  },

  async updateXp(id: string, xp: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE users SET xp = xp + ? WHERE id = ?', [xp, id]);
  },

  async updateStreak(id: string, streak: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE users SET streak = ? WHERE id = ?', [streak, id]);
  },

  async checkAndUpdateStreak(id: string): Promise<void> {
    const db = await getDb();
    const user = await db.getFirstAsync<{ lastStudyDate: string, streak: number }>('SELECT lastStudyDate, streak FROM users WHERE id = ?', [id]);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      if (user.lastStudyDate !== today) {
        // Simple logic: if it was yesterday, increment. If older, reset to 1.
        // For now, let's just increment if it's a new day.
        await db.runAsync('UPDATE users SET streak = streak + 1, lastStudyDate = ? WHERE id = ?', [today, id]);
      }
    }
  },

  async updateTodayWords(id: string, count: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE users SET todayWords = todayWords + ? WHERE id = ?', [count, id]);
  },

  async updateCompletedPractices(id: string, count = 1): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE users SET completedPractices = completedPractices + ? WHERE id = ?', [count, id]);
  },

  async createUser(user: Partial<User>): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO users (id, name, email, password, avatar, level, xp, streak, joinDate, todayWords, totalWords, totalStudyMinutes, completedLessons, completedPractices, lastStudyDate) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id || Math.random().toString(36).substr(2, 9),
        user.name || 'New User',
        user.email || null,
        user.password || null,
        user.avatar || null,
        user.level || 'Sơ cấp',
        user.xp || 0,
        user.streak || 0,
        new Date().toISOString().split('T')[0],
        0, 0, 0, 0, 0, null
      ]
    );
  }
};
