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
    console.log(`Enrolling user ${userId} in course ${courseId}`);
    const { error: enrollError } = await supabase
      .from('user_courses')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0,
        has_paid: false,
        enrolled_at: new Date().toISOString(),
        last_accessed: new Date().toISOString()
      });

    if (enrollError) {
      console.error('Error enrolling user in course:', enrollError);
      return { success: false, error: enrollError };
    }

    console.log('Enrollment successful');
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

// Function to fetch featured courses for the homepage
export const fetchFeaturedCourses = async () => {
  try {
    console.log('Fetching featured courses from Supabase');
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching featured courses:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} featured courses`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchFeaturedCourses:', error);
    return [];
  }
};

/**
 * Fetches VIP courses from Supabase
 * @returns Array of VIP courses
 */
export const fetchVipCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_premium', true);

    if (error) {
      console.error('Error fetching VIP courses:', error);
      return [];
    }

    // Transform to match our Course model
    return data.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      image: course.thumbnail_url, // For compatibility
      category: course.category,
      duration: course.duration,
      level: course.level,
      is_premium: course.is_premium,
      isPremium: course.is_premium, // For compatibility
      is_featured: course.is_featured,
      isFeatured: course.is_featured, // For compatibility
      instructor: course.instructor,
      created_at: course.created_at,
      updated_at: course.updated_at,
      status: course.status || 'published',
      price: course.price?.toString() || '',
      discount_price: course.discount_price?.toString() || '',
      discountPrice: course.discount_price?.toString() || '', // For compatibility
      objectives: course.objectives,
      requirements: course.requirements,
      color: '#4F46E5' // Default color for compatibility
    }));
  } catch (error) {
    console.error('Error fetching VIP courses:', error);
    return [];
  }
};
