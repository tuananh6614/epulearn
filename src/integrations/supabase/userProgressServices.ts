
import { supabase } from './client';

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
    console.error('Error updating course progress:', error);
    return { success: false, error };
  }
};

// Function to track user position in a lesson
export const saveLessonProgress = async (
  userId: string,
  courseId: string,
  lessonId: string,
  position: any, // Could be time position for video, or scroll position, etc.
  completed: boolean = false
) => {
  try {
    // Update the lesson progress
    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed,
        last_position: JSON.stringify(position),
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    // If the lesson is marked as completed, update overall course progress
    if (completed) {
      await updateCourseProgress(userId, courseId);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving lesson progress:', error);
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
    console.error('Error getting course progress:', error);
    return { success: false, progress: 0, error };
  }
};
