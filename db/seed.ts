import { getDb } from './client';
import { 
  MOCK_USER, 
  MOCK_COURSES, 
  MOCK_FLASHCARD_SETS, 
  MOCK_FLASHCARDS, 
  MOCK_LESSONS,
  MOCK_GRAMMAR 
} from '../constants/mock-data';

export const seedDb = async (force = false) => {
  const db = await getDb();

  if (force) {
    console.log('Forcing re-seed: Clearing tables...');
    const tables = ['users', 'courses', 'lessons', 'flashcard_sets', 'flashcards', 'grammar'];
    for (const table of tables) {
      await db.runAsync(`DELETE FROM ${table}`);
    }
  }

  // Check if seeded
  const userCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');
  const flashcardCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM flashcards');
  
  if (userCount?.count === 0) {
    console.log('Seeding database...');
    
    // Seed User
    await db.runAsync(
      `INSERT INTO users (id, name, email, password, avatar, level, xp, streak, joinDate, todayWords, totalWords, totalStudyMinutes, completedLessons, completedPractices) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        MOCK_USER.id, 
        MOCK_USER.name, 
        MOCK_USER.email, 
        '123456', // Mock password
        MOCK_USER.avatar as any, 
        MOCK_USER.level, 
        MOCK_USER.xp, 
        MOCK_USER.streak, 
        MOCK_USER.joinDate, 
        MOCK_USER.todayWords, 
        MOCK_USER.totalWords, 
        MOCK_USER.totalStudyMinutes, 
        MOCK_USER.completedLessons,
        (MOCK_USER as any).completedPractices || 8
      ]
    );

    // Seed Courses
    for (const course of MOCK_COURSES) {
      await db.runAsync(
        `INSERT INTO courses (id, title, level, totalLessons, completedLessons, progress, locked, color, currentLesson, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course.id,
          course.title,
          course.level,
          course.totalLessons,
          course.completedLessons,
          course.progress,
          course.locked ? 1 : 0,
          course.color,
          (course as any).currentLesson || null,
          course.description
        ]
      );
    }

    // Seed Lessons
    for (const lesson of MOCK_LESSONS) {
      await db.runAsync(
        `INSERT INTO lessons (id, course_id, title, duration, completed, type, is_current) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          lesson.id,
          (lesson as any).course_id || '1',
          lesson.title,
          lesson.duration,
          lesson.completed ? 1 : 0,
          lesson.type,
          (lesson as any).current ? 1 : 0
        ]
      );
    }

    // Seed Flashcard Sets
    for (const set of MOCK_FLASHCARD_SETS) {
      await db.runAsync(
        `INSERT INTO flashcard_sets (id, title, emoji, totalCards, mastered, color, category) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [set.id, set.title, set.emoji, set.totalCards, set.mastered, set.color, set.category]
      );
    }

    // Seed Flashcards
    // Seed Flashcards
    for (let i = 0; i < MOCK_FLASHCARDS.length; i++) {
      const card = MOCK_FLASHCARDS[i];
      // Distribute cards across all sets in MOCK_FLASHCARD_SETS
      const setIndex = i % MOCK_FLASHCARD_SETS.length;
      const set_id = MOCK_FLASHCARD_SETS[setIndex].id;
      
      await db.runAsync(
        `INSERT INTO flashcards (id, set_id, korean, vietnamese, pronunciation, example, exampleVi, mastered) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [card.id, set_id, card.korean, card.vietnamese, card.pronunciation, card.example, card.exampleVi, card.mastered ? 1 : 0]
      );
    }

    // Seed Grammar
    for (const g of MOCK_GRAMMAR) {
      await db.runAsync(
        `INSERT INTO grammar (id, title, description, example, explanation) 
         VALUES (?, ?, ?, ?, ?)`,
        [g.id, g.title, g.description, g.example, g.explanation]
      );
    }

    console.log('Database seeded successfully.');
  } else if (flashcardCount && flashcardCount.count < 36) {
    console.log('Flashcards missing or outdated, re-seeding flashcards...');
    await db.runAsync('DELETE FROM flashcards');
    await db.runAsync('DELETE FROM flashcard_sets');
    
    // Seed Flashcard Sets
    for (const set of MOCK_FLASHCARD_SETS) {
      await db.runAsync(
        `INSERT INTO flashcard_sets (id, title, emoji, totalCards, mastered, color, category) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [set.id, set.title, set.emoji, set.totalCards, set.mastered, set.color, set.category]
      );
    }

    // Seed Flashcards
    for (let i = 0; i < MOCK_FLASHCARDS.length; i++) {
      const card = MOCK_FLASHCARDS[i];
      const setIndex = i % MOCK_FLASHCARD_SETS.length;
      const set_id = MOCK_FLASHCARD_SETS[setIndex].id;
      
      await db.runAsync(
        `INSERT INTO flashcards (id, set_id, korean, vietnamese, pronunciation, example, exampleVi, mastered) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [card.id, set_id, card.korean, card.vietnamese, card.pronunciation, card.example, card.exampleVi, card.mastered ? 1 : 0]
      );
    }
    console.log('Flashcards re-seeded successfully.');
  }
};
