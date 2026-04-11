import { getDb } from '../client';

export interface User {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  level: string;
  xp: number;
  streak: number;
  joinDate: string;
  todayWords: number;
  totalWords: number;
  totalStudyMinutes: number;
  completedLessons: number;
}

export const userRepo = {
  async getCurrentUser(): Promise<User | null> {
    const db = await getDb();
    return await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
  },

  async updateXp(id: string, xp: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE users SET xp = xp + ? WHERE id = ?', [xp, id]);
  },

  async updateStreak(id: string, streak: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE users SET streak = ? WHERE id = ?', [streak, id]);
  },

  async updateTodayWords(id: string, count: number): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE users SET todayWords = todayWords + ? WHERE id = ?', [count, id]);
  },

  async createUser(user: Partial<User>): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO users (id, name, email, avatar, level, xp, streak, joinDate, todayWords, totalWords, totalStudyMinutes, completedLessons) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id || Math.random().toString(36).substr(2, 9),
        user.name || 'New User',
        user.email || null,
        user.avatar || null,
        user.level || 'Sơ cấp',
        user.xp || 0,
        user.streak || 0,
        new Date().toISOString().split('T')[0],
        0, 0, 0, 0
      ]
    );
  }
};
