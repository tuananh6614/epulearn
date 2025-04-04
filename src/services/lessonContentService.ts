
import { toast } from 'sonner';

// Get lesson content 
export const fetchLessonContent = async (lessonId: string) => {
  try {
    console.log(`[MOCK] Fetching content for lesson: ${lessonId}`);
    
    // Mock lesson data
    const lesson = {
      id: lessonId,
      title: `Lesson ${lessonId}`,
      content: `This is the content for lesson ${lessonId}`,
      chapter_id: '1',
      course_id: '1',
      order_index: 1,
      duration: '10 minutes',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: 'text',
      chapterTitle: 'Chapter 1',
      nextLesson: null,
      prevLesson: null
    };
    
    return lesson;
  } catch (error) {
    console.error('Error in fetchLessonContent:', error);
    toast.error("Không thể tải nội dung bài học");
    return null;
  }
};

// Mark a lesson as completed
export const markLessonAsCompleted = async (userId: string, courseId: string, lessonId: string) => {
  try {
    console.log(`[MOCK] Marking lesson ${lessonId} as completed for user ${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error in markLessonAsCompleted:', error);
    return { success: false, error };
  }
};

// Get content for a test
export const fetchTestContent = async (lessonId: string, chapterId: string) => {
  try {
    console.log(`[MOCK] Fetching test content for lesson: ${lessonId}, chapter: ${chapterId}`);
    
    return {
      title: `Bài kiểm tra: Chapter ${chapterId}`,
      description: 'Hãy hoàn thành bài kiểm tra để đánh giá kiến thức của bạn',
      timeLimit: 15, // 15 minutes by default
      questions: [
        {
          question: 'What is React?',
          options: ['A JavaScript library', 'A programming language', 'A database', 'An operating system'],
          correctAnswer: 0
        },
        {
          question: 'What is JSX?',
          options: ['A JavaScript extension', 'A programming language', 'A database query language', 'A styling system'],
          correctAnswer: 0
        }
      ]
    };
  } catch (error) {
    console.error('Error in fetchTestContent:', error);
    toast.error("Không thể tải nội dung bài kiểm tra");
    return null;
  }
};

export default {
  fetchLessonContent,
  markLessonAsCompleted,
  fetchTestContent
};
