import { getDb } from '../client';

export interface Course {
  id: string;
  title: string;
  level: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  locked: boolean;
  color: string;
  currentLesson: number | null;
  description: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'vocabulary' | 'grammar' | 'mixed';
  is_current: boolean;
}

export const courseRepo = {
  async getCourses(): Promise<Course[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM courses');
    return rows.map(row => ({
      ...row,
      locked: !!row.locked
    }));
  },

  async getCourseById(id: string): Promise<Course | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<any>('SELECT * FROM courses WHERE id = ?', [id]);
    if (!row) return null;
    return {
      ...row,
      locked: !!row.locked
    };
  },

  async getLessons(courseId: string): Promise<Lesson[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM lessons WHERE course_id = ?', [courseId]);
    return rows.map(row => ({
      ...row,
      completed: !!row.completed,
      is_current: !!row.is_current
    }));
  },

  async completeLesson(lessonId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE lessons SET completed = 1 WHERE id = ?', [lessonId]);
    
    // Update course progress
    const lesson = await db.getFirstAsync<{ course_id: string }>('SELECT course_id FROM lessons WHERE id = ?', [lessonId]);
    if (lesson) {
      const { course_id } = lesson;
      const stats = await db.getFirstAsync<{ total: number, completed: number }>(
        'SELECT COUNT(*) as total, SUM(completed) as completed FROM lessons WHERE course_id = ?',
        [course_id]
      );
      if (stats && stats.total > 0) {
        const progress = stats.completed / stats.total;
        await db.runAsync(
          'UPDATE courses SET completedLessons = ?, progress = ? WHERE id = ?',
          [stats.completed, progress, course_id]
        );
      }
    }
  }
};
