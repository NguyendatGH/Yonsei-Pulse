import { useState, useEffect } from 'react';
import { flashcardRepo, FlashcardSet, Flashcard } from '../db/repos/flashcardRepo';

export function useFlashcards(setId?: string) {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSets = async () => {
    try {
      const data = await flashcardRepo.getSets();
      setSets(data);
    } catch (err) {
      console.error('Failed to fetch flashcard sets:', err);
    }
  };

  const fetchCards = async (id: string) => {
    try {
      const data = await flashcardRepo.getCardsBySetId(id);
      setCards(data);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSets();
      if (setId) {
        await fetchCards(setId);
      }
      setLoading(false);
    };
    init();
  }, [setId]);

  const markMastered = async (cardId: string, mastered: boolean) => {
    try {
      await flashcardRepo.markMastered(cardId, mastered);
      if (setId) {
        await fetchCards(setId);
      }
      await fetchSets();
    } catch (err) {
      console.error('Failed to mark card mastered:', err);
    }
  };

  return {
    sets,
    cards,
    loading,
    markMastered,
    refreshDatasets: fetchSets
  };
}
