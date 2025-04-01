
import { supabase } from './client';
import { toast } from 'sonner';

// Add function to update course progress
export const updateCourseProgress = async (userId: string, courseId: string) => {
  try {
    // First get total lesson count for this course
    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);
      
    if (lessonError) throw lessonError;
    const totalLessons = lessons?.length || 0;
    
    if (totalLessons === 0) return { success: true };
    
    // Get completed lessons
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
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
        course_id: courseId,
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
  courseId: string,
  lessonId: string,
  chapterId: string,
  position: any, // Could be time position for video, or scroll position, etc.
  completed: boolean = false,
  currentPageId?: number // Added parameter for current page ID
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
        lesson_id: lessonId,
        course_id: courseId,
        chapter_id: chapterId,
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
export const getCourseProgress = async (userId: string, courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_courses')
      .select('progress_percentage, last_accessed')
      .eq('user_id', userId)
      .eq('course_id', courseId)
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
export const getLessonProgressInCourse = async (userId: string, courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);
      
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

// Function to get lesson pages - add this new function
export const getLessonPages = async (lessonId: string) => {
  try {
    // Use the REST API directly since the types don't include the pages table yet
    const response = await fetch(
      `https://zrpmghqlhxjwxceqihfg.supabase.co/rest/v1/pages?lesson_id=eq.${lessonId}&order=order_index.asc`,
      {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpycG1naHFsaHhqd3hjZXFpaGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NDQwNDAsImV4cCI6MjA1NzMyMDA0MH0.ZKf1u7-l6oqHCQ-J-U_FG34YcXCEYD0wlyMTQakTmnQ',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch lesson pages');
    }
    
    const data = await response.json();
    return { success: true, pages: data };
  } catch (error) {
    console.error('[UserProgress] Error getting lesson pages:', error);
    return { success: false, pages: [], error };
  }
};
