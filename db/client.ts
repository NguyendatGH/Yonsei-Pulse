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
      avatar TEXT,
      level TEXT,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      joinDate TEXT,
      todayWords INTEGER DEFAULT 0,
      totalWords INTEGER DEFAULT 0,
      totalStudyMinutes INTEGER DEFAULT 0,
      completedLessons INTEGER DEFAULT 0
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
};
