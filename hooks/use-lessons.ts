import { useState, useEffect } from 'react';
import { courseRepo, Lesson } from '../db/repos/courseRepo';

export function useLessons(courseId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await courseRepo.getLessons(courseId);
      setLessons(data);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchLessons();
    }
  }, [courseId]);

  return {
    lessons,
    loading,
    refreshLessons: fetchLessons,
  };
}
