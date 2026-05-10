import { getDb } from '../client';

export interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_blank';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  passingScore: number;
}

export const examRepo = {
  async generateExam(): Promise<Exam> {
    const db = await getDb();
    
    // Fetch random flashcards for vocabulary questions
    const flashcards = await db.getAllAsync<any>('SELECT * FROM flashcards ORDER BY RANDOM() LIMIT 5');
    
    const vocabQuestions: Question[] = flashcards.map(card => {
      // Create random options for multiple choice
      const options = [card.vietnamese];
      // Note: In a real app, you'd fetch other random meanings as distractors
      options.push('Tương tự', 'Khác biệt', 'Không rõ');
      // Shuffle options
      const shuffled = options.sort(() => Math.random() - 0.5);

      return {
        id: `v-${card.id}`,
        type: 'multiple_choice',
        question: `Nghĩa của từ "${card.korean}" là gì?`,
        options: shuffled,
        correctAnswer: shuffled.indexOf(card.vietnamese),
      };
    });

    // Add some fixed grammar questions or fetch from grammar table if it has questions
    const grammarQuestions: Question[] = [
      {
        id: 'g-1',
        type: 'multiple_choice',
        question: 'Chọn hậu tố đúng cho: "Hôm nay tôi ____ (đi) học."',
        options: ['가요', '가요?', '가'],
        correctAnswer: 0,
      },
      {
        id: 'g-2',
        type: 'fill_blank',
        question: 'Điền vào chỗ trống: "안녕하세요. 저는 ____ 입니다." (Tên của bạn)',
        correctAnswer: '...', // Placeholder for generic check or specific logic
      }
    ];

    return {
      id: 'dynamic-exam-' + Date.now(),
      title: 'Đề thi năng lực Tiếng Hàn',
      questions: [...vocabQuestions, ...grammarQuestions],
      passingScore: 70,
    };
  }
};
