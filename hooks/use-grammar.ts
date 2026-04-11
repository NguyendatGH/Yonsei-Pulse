import { useState, useEffect } from 'react';
import { grammarRepo, Grammar } from '../db/repos/grammarRepo';

export function useGrammar() {
  const [grammarList, setGrammarList] = useState<Grammar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGrammar = async () => {
    try {
      setLoading(true);
      const data = await grammarRepo.getAll();
      setGrammarList(data);
    } catch (err) {
      console.error('Failed to fetch grammar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrammar();
  }, []);

  return { grammarList, loading, refreshGrammar: fetchGrammar };
}
