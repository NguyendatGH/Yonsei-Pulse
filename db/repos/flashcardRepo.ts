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

  async markMastered(cardId: string, mastered: boolean): Promise<void> {
    const db = await getDb();
    const masteredVal = mastered ? 1 : 0;
    await db.runAsync('UPDATE flashcards SET mastered = ? WHERE id = ?', [masteredVal, cardId]);
    
    // Update mastered count in set
    const card = await db.getFirstAsync<{ set_id: string }>('SELECT set_id FROM flashcards WHERE id = ?', [cardId]);
    if (card) {
      const { set_id } = card;
      const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM flashcards WHERE set_id = ? AND mastered = 1', [set_id]);
      if (result) {
        await db.runAsync('UPDATE flashcard_sets SET mastered = ? WHERE id = ?', [result.count, set_id]);
      }
    }
  }
};
