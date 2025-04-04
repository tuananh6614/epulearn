
/**
 * User Progress Services
 * 
 * Mock implementation for user progress tracking functionality
 */

// Get user progress for a specific lesson
export const getLessonProgress = async (userId: string, lessonId: string | number) => {
  console.log(`[MOCK] Getting progress for lesson: ${lessonId}, user: ${userId}`);
  
  // Return mock data
  return {
    completed: Math.random() > 0.5,
    progress_percentage: Math.floor(Math.random() * 100),
    last_position: Math.floor(Math.random() * 100),
    updated_at: new Date().toISOString()
  };
};

// Save user progress for a lesson
export const saveLessonProgress = async (
  userId: string, 
  courseId: string | number,
  chapterId: string | number,
  lessonId: string | number,
  position = { scrollPosition: 0 },
  completed = true,
  currentPageId?: string | number
) => {
  console.log(`[MOCK] Saving progress for lesson: ${lessonId}, user: ${userId}, completed: ${completed}`);
  
  // Return success response
  return {
    success: true,
    error: null
  };
};

// Get lesson pages
export const getLessonPages = async (lessonId: string | number) => {
  console.log(`[MOCK] Getting pages for lesson: ${lessonId}`);
  
  // Return mock pages data
  return {
    success: true,
    pages: [
      { id: 1, lesson_id: lessonId, title: "Introduction", content: "This is the introduction page", order_index: 1 },
      { id: 2, lesson_id: lessonId, title: "Main Content", content: "This is the main content page", order_index: 2 },
      { id: 3, lesson_id: lessonId, title: "Summary", content: "This is the summary page", order_index: 3 }
    ],
    error: null
  };
};

// Get course progress
export const getCourseProgress = async (userId: string, courseId: string | number) => {
  console.log(`[MOCK] Getting course progress for course: ${courseId}, user: ${userId}`);
  
  return {
    progress_percentage: Math.floor(Math.random() * 100),
    completed_lessons: Math.floor(Math.random() * 10),
    total_lessons: 10,
    last_accessed: new Date().toISOString()
  };
};

export default {
  getLessonProgress,
  saveLessonProgress,
  getLessonPages,
  getCourseProgress
};
