import { useState, useEffect } from 'react';
import { courseRepo, Course, Lesson } from '../db/repos/courseRepo';

export function useCourses(courseId?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const data = await courseRepo.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchLessons = async (id: string) => {
    try {
      const data = await courseRepo.getLessons(id);
      setLessons(data);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCourses();
      if (courseId) {
        await fetchLessons(courseId);
      }
      setLoading(false);
    };
    init();
  }, [courseId]);

  const completeLesson = async (lessonId: string) => {
    try {
      await courseRepo.completeLesson(lessonId);
      if (courseId) {
        await fetchLessons(courseId);
      }
      await fetchCourses();
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  return {
    courses,
    lessons,
    loading,
    completeLesson,
    refreshCourses: fetchCourses
  };
}
