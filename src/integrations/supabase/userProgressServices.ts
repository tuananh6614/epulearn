
import { supabase } from './client';
import { toast } from 'sonner';

// Add function to update course progress
export const updateCourseProgress = async (userId: string, courseId: number | string) => {
  try {
    // First get total lesson count for this course
    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId.toString());
      
    if (lessonError) throw lessonError;
    const totalLessons = lessons?.length || 0;
    
    if (totalLessons === 0) return { success: true };
    
    // Get completed lessons
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId.toString())
      .eq('completed', true);
      
    if (progressError) throw progressError;
    const completedLessons = progress?.length || 0;
    
    // Calculate percentage
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    
    // Update user_courses table
    const { error: updateError } = await supabase
      .from('user_courses')
      .upsert({
        user_id: userId,
        course_id: courseId.toString(),
        progress_percentage: progressPercentage,
        last_accessed: new Date().toISOString()
      });
      
    if (updateError) throw updateError;
    
    return { success: true, progress: progressPercentage };
  } catch (error) {
    console.error('[UserProgress] Error updating course progress:', error);
    return { success: false, error };
  }
};

// Function to track user position in a lesson
export const saveLessonProgress = async (
  userId: string,
  courseId: number | string,
  lessonId: number | string,
  chapterId: number | string,
  position: any, // Could be time position for video, or scroll position, etc.
  completed: boolean = false,
  currentPageId?: number // Page ID is already an integer
) => {
  try {
    console.log('[UserProgress] Saving lesson progress:', { 
      userId, courseId, lessonId, chapterId, completed, currentPageId
    });
    
    // Update the lesson progress
    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId.toString(),
        course_id: courseId.toString(),
        chapter_id: chapterId.toString(),
        completed,
        last_position: JSON.stringify(position),
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        current_page_id: currentPageId // Store the current page ID
      });
      
    if (error) {
      console.error('[UserProgress] Error in user_lesson_progress upsert:', error);
      throw error;
    }
    
    // If the lesson is marked as completed, update overall course progress
    if (completed) {
      await updateCourseProgress(userId, courseId);
    }
    
    return { success: true };
  } catch (error) {
    console.error('[UserProgress] Error saving lesson progress:', error);
    toast.error('Không thể lưu tiến độ học tập. Vui lòng thử lại sau.');
    return { success: false, error };
  }
};

// Function to get the user's progress in a course
export const getCourseProgress = async (userId: string, courseId: number | string) => {
  try {
    const { data, error } = await supabase
      .from('user_courses')
      .select('progress_percentage, last_accessed')
      .eq('user_id', userId)
      .eq('course_id', courseId.toString())
      .maybeSingle(); // Using maybeSingle instead of single to avoid errors if no data
      
    if (error) throw error;
    
    return {
      success: true,
      progress: data?.progress_percentage || 0,
      lastAccessed: data?.last_accessed || null
    };
  } catch (error) {
    console.error('[UserProgress] Error getting course progress:', error);
    return { success: false, progress: 0, error };
  }
};

// Lấy tiến độ của tất cả các bài học trong một khóa học
export const getLessonProgressInCourse = async (userId: string, courseId: number | string) => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId.toString());
      
    if (error) throw error;
    
    const progressMap = (data || []).reduce((map: Record<string, any>, item) => {
      map[item.lesson_id] = item;
      return map;
    }, {});
    
    return { success: true, progressMap };
  } catch (error) {
    console.error('[UserProgress] Error getting lesson progress:', error);
    return { success: false, progressMap: {}, error };
  }
};

// Function to get lesson pages
export const getLessonPages = async (lessonId: number | string) => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('lesson_id', lessonId.toString())
      .order('order_index', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return { success: true, pages: data };
  } catch (error) {
    console.error('[UserProgress] Error getting lesson pages:', error);
    return { success: false, pages: [], error };
  }
};
