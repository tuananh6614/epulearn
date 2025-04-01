
import { supabase } from './client';
import { toast } from 'sonner';
import { supabaseId } from '@/utils/idConverter';

// Add function to update course progress
export const updateCourseProgress = async (userId: string, courseId: string | number) => {
  try {
    // First get total lesson count for this course
    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', supabaseId(courseId));
      
    if (lessonError) throw lessonError;
    const totalLessons = lessons?.length || 0;
    
    if (totalLessons === 0) return { success: true };
    
    // Get completed lessons
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', supabaseId(courseId))
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
        course_id: supabaseId(courseId),
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
  courseId: string | number,
  lessonId: string | number,
  chapterId: string | number,
  position: any, // Could be time position for video, or scroll position, etc.
  completed: boolean = false,
  currentPageId?: number | string // Page ID
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
        lesson_id: supabaseId(lessonId),
        course_id: supabaseId(courseId),
        chapter_id: supabaseId(chapterId),
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
export const getCourseProgress = async (userId: string, courseId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('user_courses')
      .select('progress_percentage, last_accessed')
      .eq('user_id', userId)
      .eq('course_id', supabaseId(courseId))
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
export const getLessonProgressInCourse = async (userId: string, courseId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', supabaseId(courseId));
      
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
export const getLessonPages = async (lessonId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('lesson_id', supabaseId(lessonId))
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
