/**
 * Simple analytics service for tracking user engagement and retention.
 */
export const analytics = {
  logEvent(eventName: string, params?: Record<string, any>) {
    console.log(`[Analytics] Event: ${eventName}`, params || '');
    // In a real app, you would send this to Firebase, Mixpanel, etc.
  },

  trackLessonComplete(lessonId: string, courseId: string, xp: number) {
    this.logEvent('lesson_complete', { lessonId, courseId, xp, timestamp: new Date().toISOString() });
  },

  trackFlashcardReview(masteredCount: number, totalCount: number) {
    this.logEvent('flashcard_review', { masteredCount, totalCount, timestamp: new Date().toISOString() });
  },

  trackExamResult(score: number, passed: boolean) {
    this.logEvent('exam_result', { score, passed, timestamp: new Date().toISOString() });
  }
};
