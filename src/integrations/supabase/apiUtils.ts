
import { supabase } from './client';

// Function to enroll a user in a course
export const enrollUserInCourse = async (userId: string, courseId: string): Promise<{success: boolean; error?: any}> => {
  try {
    if (!userId || !courseId) {
      console.error('Missing required parameters for course enrollment');
      return { success: false, error: 'Missing user ID or course ID' };
    }

    // Check if user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('user_courses')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing enrollment:', checkError);
      return { success: false, error: checkError };
    }

    // If already enrolled, return success
    if (existingEnrollment) {
      return { success: true };
    }

    // Enroll the user in the course
    const { error: enrollError } = await supabase
      .from('user_courses')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0,
        has_paid: false,
        last_accessed: new Date().toISOString()
      });

    if (enrollError) {
      console.error('Error enrolling user in course:', enrollError);
      return { success: false, error: enrollError };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in enrollUserInCourse:', error);
    return { success: false, error };
  }
};

// Function to update the last accessed timestamp for a course
export const updateCourseLastAccessed = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_courses')
      .update({ last_accessed: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    return !error;
  } catch (error) {
    console.error('Error updating last accessed timestamp:', error);
    return false;
  }
};
