import { getDb } from '../client';

export interface FlashcardSet {
  id: string;
  title: string;
  emoji: string | null;
  totalCards: number;
  mastered: number;
  color: string;
  category: string;
}

export interface Flashcard {
  id: string;
  set_id: string;
  korean: string;
  vietnamese: string;
  pronunciation: string | null;
  example: string | null;
  exampleVi: string | null;
  mastered: boolean;
  review_at: string | null;
  interval: number;
  ease_factor: number;
  repetitions: number;
}

/**
 * SM-2 Spaced Repetition Algorithm
 * quality: 0 = complete blackout, 5 = perfect
 * Returns { interval (days), easeFactor, repetitions }
 */
function sm2(quality: number, repetitions: number, easeFactor: number, interval: number) {
  let newEf = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEf < 1.3) newEf = 1.3;

  let newRepetitions = repetitions;
  let newInterval = interval;

  if (quality < 3) {
    // Forgot — reset
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions += 1;
    if (newRepetitions === 1) newInterval = 1;
    else if (newRepetitions === 2) newInterval = 6;
    else newInterval = Math.round(interval * newEf);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    easeFactor: newEf,
    repetitions: newRepetitions,
    review_at: nextReview.toISOString(),
  };
}

export const flashcardRepo = {
  async getSets(): Promise<FlashcardSet[]> {
    const db = await getDb();
    return await db.getAllAsync<FlashcardSet>('SELECT * FROM flashcard_sets');
  },

  async getCardsBySetId(setId: string): Promise<Flashcard[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM flashcards WHERE set_id = ?', [setId]);
    return rows.map(row => ({
      ...row,
      mastered: !!row.mastered
    }));
  },

  /** Get cards due for review (review_at <= now OR never reviewed) */
  async getDueCards(setId?: string): Promise<Flashcard[]> {
    const db = await getDb();
    const now = new Date().toISOString();
    const query = setId
      ? 'SELECT * FROM flashcards WHERE set_id = ? AND (review_at IS NULL OR review_at <= ?)'
      : 'SELECT * FROM flashcards WHERE review_at IS NULL OR review_at <= ?';
    const params = setId ? [setId, now] : [now];
    const rows = await db.getAllAsync<any>(query, params);
    return rows.map(row => ({ ...row, mastered: !!row.mastered }));
  },

  async markMastered(cardId: string, qualityOrMastered: number | boolean): Promise<void> {
    const db = await getDb();
    const isQuality = typeof qualityOrMastered === 'number';
    const quality = isQuality ? qualityOrMastered : (qualityOrMastered ? 5 : 1);
    const masteredVal = (quality >= 4) ? 1 : 0;

    const card = await db.getFirstAsync<any>('SELECT * FROM flashcards WHERE id = ?', [cardId]);
    if (card) {
      const srs = sm2(quality, card.repetitions ?? 0, card.ease_factor ?? 2.5, card.interval ?? 0);

      await db.runAsync(
        'UPDATE flashcards SET mastered = ?, review_at = ?, interval = ?, ease_factor = ?, repetitions = ? WHERE id = ?',
        [masteredVal, srs.review_at, srs.interval, srs.easeFactor, srs.repetitions, cardId]
      );

      // Update mastered count in set
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM flashcards WHERE set_id = ? AND mastered = 1',
        [card.set_id]
      );
      if (result) {
        await db.runAsync('UPDATE flashcard_sets SET mastered = ? WHERE id = ?', [result.count, card.set_id]);
      }
    }
  },

  async getSetStats(setId: string): Promise<{ total: number; due: number; mastered: number }> {
    const db = await getDb();
    const now = new Date().toISOString();
    const total = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM flashcards WHERE set_id = ?', [setId]);
    const mastered = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM flashcards WHERE set_id = ? AND mastered = 1', [setId]);
    const due = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM flashcards WHERE set_id = ? AND (review_at IS NULL OR review_at <= ?)',
      [setId, now]
    );
    return {
      total: total?.count ?? 0,
      mastered: mastered?.count ?? 0,
      due: due?.count ?? 0,
    };
  }
};
