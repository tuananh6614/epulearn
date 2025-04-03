
import { toast } from 'sonner';

// Mock lesson data
const mockLessons = {
  '1': {
    id: '1',
    title: 'Introduction to JavaScript',
    content: 'JavaScript is a versatile programming language...',
    chapter_id: '1',
    course_id: '1',
    order_index: 1
  },
  '2': {
    id: '2',
    title: 'Variables and Data Types',
    content: 'In JavaScript, variables are used to store data...',
    chapter_id: '1',
    course_id: '1',
    order_index: 2
  }
};

// Mock chapters data
const mockChapters = {
  '1': {
    id: '1',
    title: 'JavaScript Fundamentals',
    course_id: '1'
  }
};

// Get lesson content
export const fetchLessonContent = async (lessonId: string) => {
  try {
    console.log(`Fetching content for lesson: ${lessonId}`);
    
    // Get the lesson
    const lesson = mockLessons[lessonId];
      
    if (!lesson) {
      console.log(`No lesson found with ID ${lessonId}`);
      return null;
    }
    
    // Get the chapter
    const chapter = mockChapters[lesson.chapter_id];
      
    // Get next and previous lessons
    const allLessons = Object.values(mockLessons)
      .filter(l => l.course_id === lesson.course_id)
      .sort((a, b) => a.order_index - b.order_index);
      
    // Find the current lesson index
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    let nextLesson = null;
    let prevLesson = null;
    
    if (currentIndex !== -1) {
      if (currentIndex > 0) {
        prevLesson = allLessons[currentIndex - 1].id;
      }
      
      if (currentIndex < allLessons.length - 1) {
        nextLesson = allLessons[currentIndex + 1].id;
      }
    }
    
    return {
      ...lesson,
      chapterTitle: chapter?.title || 'Unknown Chapter',
      nextLesson,
      prevLesson
    };
  } catch (error) {
    console.error('Error in fetchLessonContent:', error);
    toast.error("Không thể tải nội dung bài học");
    return null;
  }
};

// Mark a lesson as completed
export const markLessonAsCompleted = async (userId: string, courseId: string, lessonId: string) => {
  try {
    console.log(`Marking lesson ${lessonId} as completed for user ${userId}`);
    
    // Mock implementation
    return { success: true };
  } catch (error) {
    console.error('Error in markLessonAsCompleted:', error);
    return { success: false, error };
  }
};

// Get content for a test
export const fetchTestContent = async (lessonId: string, chapterId: string) => {
  try {
    console.log(`Fetching test content for lesson: ${lessonId}, chapter: ${chapterId}`);
    
    // Mock test content
    return {
      title: `Bài kiểm tra: ${mockChapters[chapterId]?.title || 'Chương không xác định'}`,
      description: 'Hãy hoàn thành bài kiểm tra để đánh giá kiến thức của bạn',
      timeLimit: 15, // 15 minutes by default
      questions: [
        {
          question: "JavaScript là ngôn ngữ lập trình phía nào?",
          options: ["Frontend", "Backend", "Cả hai", "Không có câu trả lời đúng"],
          correctAnswer: 2
        },
        {
          question: "React là gì?",
          options: ["Thư viện JavaScript", "Framework PHP", "Ngôn ngữ lập trình", "Cơ sở dữ liệu"],
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
