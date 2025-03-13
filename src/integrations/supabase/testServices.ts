
import { supabase } from './client';

// Helper functions for test data
export const fetchTestQuestions = async (chapterId: string) => {
  try {
    const { data, error } = await supabase
      .from('chapter_tests')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching test questions:', error);
    return [];
  }
};

export const saveTestResult = async (
  userId: string, 
  courseId: string,
  chapterId: string,
  lessonId: string,
  score: number, 
  totalQuestions: number
) => {
  try {
    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;
    
    // First update the lesson progress
    await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed: passed,
        last_position: JSON.stringify({
          score,
          total: totalQuestions,
          percentage
        }),
        completed_at: passed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      });
    
    // Then update the overall course progress
    await updateCourseProgress(userId, courseId);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving test result:', error);
    return { success: false, error };
  }
};

// Import the updateCourseProgress function from another module
import { updateCourseProgress } from './userProgressServices';
