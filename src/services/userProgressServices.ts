
import { api } from '@/integrations/api/client';

export const saveLessonProgress = async (
  userId: string,
  courseId: string | number,
  chapterId: string | number,
  lessonId: string | number,
  position?: any,
  completed?: boolean,
  currentPageId?: string | number
) => {
  console.log(`[MOCK] Saving lesson progress for user ${userId}, lesson ${lessonId}`);
  try {
    const progress = {
      user_id: userId,
      course_id: courseId,
      chapter_id: chapterId,
      lesson_id: lessonId,
      last_position: position ? JSON.stringify(position) : null,
      completed: completed !== undefined ? completed : true,
      current_page_id: currentPageId,
      updated_at: new Date().toISOString()
    };
    
    // Save to local storage as a mock
    const storageKey = `lesson_progress_${userId}_${lessonId}`;
    localStorage.setItem(storageKey, JSON.stringify(progress));
    
    return progress;
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    throw error;
  }
};

export const getLessonPages = async (lessonId: string | number) => {
  console.log(`[MOCK] Fetching pages for lesson ${lessonId}`);
  
  try {
    // Return mock pages
    return {
      success: true,
      pages: [
        {
          id: 1,
          lesson_id: lessonId,
          title: "Introduction",
          content: "<p>Welcome to this lesson</p>",
          order_index: 1
        },
        {
          id: 2,
          lesson_id: lessonId,
          title: "Main Content",
          content: "<p>This is the main content of the lesson</p>",
          order_index: 2
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching lesson pages:', error);
    return { success: false, error: "Failed to fetch lesson pages" };
  }
};
