# Implementation Plan: Migrate App Data to SQLite

## Overview
Currently, the application uses static mock data (`mock-data.ts`) for all UI previews. This plan outlines the migration process to replace most of the mock data with a local SQLite database (`expo-sqlite`) to enable offline data persistence for user profiles, flashcards, sample exercises, and grammar, while keeping the listening practice (`MOCK_LISTENING_PARAGRAPHS`) as mock data.

## Requirements
- Setup `expo-sqlite` in the project.
- Design and create database schemas for User Info, Courses/Lessons, Flashcards, and Grammar.
- Write database seeding script to populate initial data (courses, flashcards, grammar).
- Implement a Data Access Layer (DAL) or custom React Hooks to query and update the SQLite databases.
- Integrate the new hooks into the UI components, replacing imports from `mock-data.ts`.
- Retain `MOCK_LISTENING_PARAGRAPHS` in `mock-data.ts`.

## Architecture Changes
- **Dependencies**: Add `expo-sqlite` to handle local offline storage.
- **Database Initialization**: Create a provider/hook (e.g., `app/context/DatabaseContext.tsx` or util `lib/database.ts`) to open the database and run initial schema migrations/seeding.
- **State Management**: Replace static states with asynchronous data fetching hooks (`useQuery` style or standard `useEffect` hooks) fetching from SQLite.
- **Folder Structure**: Add `db/` folder to store schema definitions, migrations, and repositories (CRUD operations).

## Implementation Steps

### Phase 1: Infrastructure & Configuration
1. **Install Dependencies** (Terminal)
   - Action: Run `npx expo install expo-sqlite`.
   - Why: Adds native SQLite support.
   - Risk: Low.
2. **Database Initialization** (File: `src/db/client.ts` / `src/db/schema.ts`)
   - Action: Create a function to open SQLite database (`SQLite.openDatabaseSync` or async equivalent) and execute `CREATE TABLE IF NOT EXISTS` commands for:
     - `users` (id, name, xp, streak, level, ...)
     - `courses` & `lessons`
     - `flashcard_sets` & `flashcards`
     - `grammar` & `exercises`
   - Why: Prepare local storage schema.
   - Dependencies: Step 1.
3. **Database Seeding** (File: `src/db/seed.ts`)
   - Action: Write a function to check if tables are empty, and if so, insert the default structured data from `mock-data.ts` (except listening parts).
   - Why: Provide initial application data for users.
   - Dependencies: Step 2.

### Phase 2: Data Access Layer (DAL) / Hooks
1. **User Profile Hooks** (File: `src/hooks/useUser.ts` / `src/db/userRepo.ts`)
   - Action: Implement `getUser()`, `updateUserXp()`, `updateStreak()`.
   - Why: Abstract SQL logic from components.
2. **Flashcards Hooks** (File: `src/hooks/useFlashcards.ts` / `src/db/flashcardRepo.ts`)
   - Action: Implement `getFlashcardSets()`, `getFlashcardsBySetId()`, `markFlashcardMastered()`.
   - Why: Manage flashcard progress persistence.
3. **Courses & Grammar Hooks** (File: `src/hooks/useCourses.ts`)
   - Action: Implement `getCourses()`, `getLessons(courseId)`, `updateLessonProgress()`.
   - Why: Persist Yonsei lesson progression.

### Phase 3: UI Integration
1. **Global Database Provider** (File: `app/_layout.tsx`)
   - Action: Add `<SQLiteProvider>` (if using `expo-sqlite` React components) or trigger the `initDB()` + `seedDB()` on app mount. Show a splash screen while loading.
   - Why: Prevent UI rendering before DB is ready.
   - Dependencies: Phase 1 & 2.
2. **Update Dashboard / Library Screens** (File: Various inside `app/`)
   - Action: Replace `MOCK_USER`, `MOCK_COURSES`, `MOCK_FLASHCARD_SETS` with the respective hooks (e.g., `const { user } = useUser();`).
   - Why: Display live SQLite data on the UI.
   - Risk: Medium — Need to handle loading states (`isLoading`, `user == null`).
3. **Update Practice Mode / Quizzes**
   - Action: Update mutations when a user finishes a quiz/flashcard to save progress to SQLite instead of local transient state.

### Phase 4: Clean Up & Mock Data Retention
1. **Prune Mock Data** (File: `constants/mock-data.ts`)
   - Action: Remove unused objects (`MOCK_USER`, `MOCK_COURSE`, etc.) but strictly keep `MOCK_LISTENING_PARAGRAPHS` and its related types.
   - Why: Avoid duplicate dead code while fulfilling the requirement to keep listening as mock.

## Testing Strategy
- Unit tests: Mock `expo-sqlite` to verify CRUD queries.
- Integration tests: Verify the seeding mechanism accurately duplicates `mock-data.ts` base state into the database.
- E2E / Manual tests: Restart the app and verify if "completed" flashcards and "earned XP" remain persisted across app reloads.

## Risks & Mitigations
- **Risk**: The asynchronous nature of SQLite slows down initial UI rendering.
  - Mitigation: Pre-load the DB during the Expo Splash Screen phase, displaying the UI only when initialization is completely done.
- **Risk**: Future app updates require schema changes.
  - Mitigation: Add a simple `user_version` PRAGMA check or schema versioning table to run migrations later.

## Success Criteria
- [ ] `expo-sqlite` is successfully installed and initialized.
- [ ] User profile, current XP, and streaks survive complete app restarts.
- [ ] Yonsei Courses progress and Flashcard mastered statuses are saved locally.
- [ ] UI components reflect data accurately from SQLite instead of raw constants.
- [ ] Listening sections continue to work normally utilizing `MOCK_LISTENING_PARAGRAPHS`.
