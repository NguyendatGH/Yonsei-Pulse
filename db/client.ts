import * as SQLite from 'expo-sqlite';

const DB_NAME = 'yonsei_pulse.db';

export const getDb = async () => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};

export const initDb = async () => {
  const db = await getDb();
  
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create Users Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      password TEXT,
      avatar TEXT,
      level TEXT,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      joinDate TEXT,
      todayWords INTEGER DEFAULT 0,
      totalWords INTEGER DEFAULT 0,
      totalStudyMinutes INTEGER DEFAULT 0,
      completedLessons INTEGER DEFAULT 0,
      completedPractices INTEGER DEFAULT 0,
      lastStudyDate TEXT
    );
  `);

  // Create Courses Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      level TEXT,
      totalLessons INTEGER DEFAULT 0,
      completedLessons INTEGER DEFAULT 0,
      progress REAL DEFAULT 0,
      locked INTEGER DEFAULT 0,
      color TEXT,
      currentLesson INTEGER,
      description TEXT
    );
  `);

  // Create Lessons Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      duration TEXT,
      completed INTEGER DEFAULT 0,
      type TEXT,
      is_current INTEGER DEFAULT 0,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );
  `);

  // Create Flashcard Sets Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS flashcard_sets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      emoji TEXT,
      totalCards INTEGER DEFAULT 0,
      mastered INTEGER DEFAULT 0,
      color TEXT,
      category TEXT
    );
  `);

  // Create Flashcards Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      set_id TEXT,
      korean TEXT NOT NULL,
      vietnamese TEXT NOT NULL,
      pronunciation TEXT,
      example TEXT,
      exampleVi TEXT,
      mastered INTEGER DEFAULT 0,
      review_at TEXT,
      interval INTEGER DEFAULT 1,
      ease_factor REAL DEFAULT 2.5,
      repetitions INTEGER DEFAULT 0,
      FOREIGN KEY (set_id) REFERENCES flashcard_sets (id) ON DELETE CASCADE
    );
  `);

  // Create Grammar Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS grammar (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      level TEXT,
      category TEXT,
      content TEXT
    );
  `);

  // Create Daily Stats Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      minutes INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      words_learned INTEGER DEFAULT 0
    );
  `);

  // Create Dictation History Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS dictation_history (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      accuracy_score INTEGER NOT NULL,
      total_blanks INTEGER NOT NULL,
      correct_blanks INTEGER NOT NULL
    );
  `);

  // Create Exam History Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exam_history (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      score INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      time_taken TEXT NOT NULL
    );
  `);

  // Create Flashcard History Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS flashcard_history (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      card_id TEXT,
      is_correct INTEGER NOT NULL,
      FOREIGN KEY (card_id) REFERENCES flashcards (id) ON DELETE CASCADE
    );
  `);

  // Migration: Add missing columns to tables
  await migrateFlashcardsTable(db);
  await migrateUsersTable(db);
};

async function migrateUsersTable(db: Awaited<ReturnType<typeof getDb>>) {
  try {
    await db.execAsync('ALTER TABLE users ADD COLUMN completedPractices INTEGER DEFAULT 0');
  } catch {}
}

async function migrateFlashcardsTable(db: Awaited<ReturnType<typeof getDb>>) {
  try {
    await db.execAsync('ALTER TABLE flashcards ADD COLUMN review_at TEXT');
  } catch {}
  try {
    await db.execAsync('ALTER TABLE flashcards ADD COLUMN interval INTEGER DEFAULT 1');
  } catch {}
  try {
    await db.execAsync('ALTER TABLE flashcards ADD COLUMN ease_factor REAL DEFAULT 2.5');
  } catch {}
  try {
    await db.execAsync('ALTER TABLE flashcards ADD COLUMN repetitions INTEGER DEFAULT 0');
  } catch {}
}
