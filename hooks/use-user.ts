import { useState, useEffect } from 'react';
import { userRepo, User } from '../db/repos/userRepo';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await userRepo.getCurrentUser();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const addXp = async (amount: number) => {
    if (!user) return;
    try {
      await userRepo.updateXp(user.id, amount);
      await fetchUser(); // Refresh local state
    } catch (err) {
      console.error('Failed to update XP:', err);
    }
  };

  const updateStreak = async () => {
    if (!user) return;
    try {
      await userRepo.checkAndUpdateStreak(user.id);
      await fetchUser();
    } catch (err) {
      console.error('Failed to update streak:', err);
    }
  };

  const incrementCompletedPractices = async (count = 1) => {
    if (!user) return;
    try {
      await userRepo.updateCompletedPractices(user.id, count);
      await fetchUser();
    } catch (err) {
      console.error('Failed to update completed practices:', err);
    }
  };

  return {
    user,
    loading,
    error,
    addXp,
    updateStreak,
    incrementCompletedPractices,
    refreshUser: fetchUser
  };
}
