/**
 * Utility functions for API requests
 */
import { supabase } from "@/integrations/supabase/client";
import { EnrolledCourse, UserCertificate } from "@/models/lesson";

// Base URL for external APIs (if still needed)
export const API_URL = import.meta.env.PROD 
  ? 'https://your-production-api-url.com/api' 
  : 'http://localhost:3000/api';

/**
 * Make a fetch request with timeout and error handling
 */
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 10000
): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * Check if the API is available
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // For Supabase, we can simply check if we can access the public schema
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (error) {
      console.warn("Supabase connection check failed:", error.message);
      return false;
    }
    
    console.log("Supabase connection check successful");
    return true;
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    return false;
  }
};

/**
 * Handle API response
 */
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    try {
      // Try to parse as JSON
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `API error: ${response.status}`);
    } catch (e) {
      // If parsing fails, use the text directly
      throw new Error(`API error: ${response.status} - ${errorText || 'Unknown error'}`);
    }
  }
  
  return response.json();
};

/**
 * Kiểm tra kết nối API và trả về chi tiết lỗi
 */
export const getDetailedApiStatus = async (): Promise<{
  connected: boolean;
  message: string;
  statusCode?: number;
}> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (error) {
      return {
        connected: false,
        message: `Lỗi kết nối: ${error.message}`,
        statusCode: error.code ? parseInt(error.code) : undefined
      };
    }
    
    return {
      connected: true,
      message: "Kết nối thành công với Supabase"
    };
  } catch (error) {
    return {
      connected: false,
      message: `Không thể kết nối với Supabase: ${(error as Error).message}`
    };
  }
};

// Supabase specific utility functions

/**
 * Fetch courses from Supabase
 */
export const fetchCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select()
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching courses:", error);
    throw new Error(error.message);
  }
  
  // Format the duration for display
  const formattedData = data?.map(course => ({
    ...course,
    duration: formatDuration(course.duration)
  })) || [];
  
  return formattedData;
};

/**
 * Fetch featured courses from Supabase
 */
export const fetchFeaturedCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select()
    .eq('is_featured', true)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching featured courses:", error);
    throw new Error(error.message);
  }
  
  // Format the duration for display
  const formattedData = data?.map(course => ({
    ...course,
    duration: formatDuration(course.duration)
  })) || [];
  
  return formattedData;
};

/**
 * Fetch a course by ID
 */
export const fetchCourseById = async (courseId: string) => {
  // Fetch the course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select()
    .eq('id', courseId)
    .single();
  
  if (courseError) {
    console.error("Error fetching course:", courseError);
    throw new Error(courseError.message);
  }
  
  // Fetch the chapters for this course
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select()
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  
  if (chaptersError) {
    console.error("Error fetching chapters:", chaptersError);
    throw new Error(chaptersError.message);
  }
  
  // Fetch lessons for each chapter
  const chaptersWithLessons = await Promise.all((chapters || []).map(async (chapter) => {
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select()
      .eq('chapter_id', chapter.id)
      .order('order_index', { ascending: true });
    
    if (lessonsError) {
      console.error("Error fetching lessons:", lessonsError);
      throw new Error(lessonsError.message);
    }
    
    return {
      ...chapter,
      lessons: lessons || []
    };
  }));
  
  // Format durations for display
  const formattedCourse = {
    ...course,
    duration: formatDuration(course.duration)
  };
  
  // Return the complete course object with chapters and lessons
  return {
    ...formattedCourse,
    chapters: chaptersWithLessons
  };
};

/**
 * Fetch user's enrolled courses
 */
export const fetchUserEnrolledCourses = async (userId: string): Promise<EnrolledCourse[]> => {
  const { data, error } = await supabase
    .from('user_courses')
    .select(`
      id,
      progress_percentage,
      is_completed,
      course_id,
      courses:course_id (
        id, 
        title, 
        description,
        thumbnail_url,
        duration,
        level,
        category,
        is_premium,
        price,
        discount_price,
        status
      )
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error fetching enrolled courses:", error);
    throw new Error(error.message);
  }
  
  // Format the data to match the expected structure
  return (data || []).map(enrollment => ({
    id: enrollment.courses.id,
    title: enrollment.courses.title,
    description: enrollment.courses.description,
    image: enrollment.courses.thumbnail_url || '/placeholder.svg',
    progress: enrollment.progress_percentage,
    duration: formatDuration(enrollment.courses.duration),
    level: enrollment.courses.level,
    category: enrollment.courses.category,
    color: enrollment.courses.is_premium ? '#ffd700' : '#4f46e5', // Gold for premium, blue for regular
    isPremium: enrollment.courses.is_premium,
    price: enrollment.courses.price,
    discountPrice: enrollment.courses.discount_price,
    status: enrollment.courses.status,
    isCompleted: enrollment.is_completed
  }));
};

/**
 * Helper function to format duration for display
 */
export const formatDuration = (duration: string | null): string => {
  if (!duration) return 'N/A';
  
  try {
    // If it's already a formatted string like "10 hours" or "45 minutes", return as is
    if (typeof duration === 'string' && !duration.includes('P') && !duration.includes('T')) {
      return duration;
    }
    
    // Try to parse PostgreSQL interval format
    // This is a simplified approach - for a production app, use a dedicated duration library
    const hours = duration.toString().match(/(\d+):(\d+):(\d+)/);
    if (hours) {
      const h = parseInt(hours[1]);
      const m = parseInt(hours[2]);
      
      if (h > 0) {
        return `${h} ${h === 1 ? 'hour' : 'hours'}${m > 0 ? ` ${m} ${m === 1 ? 'minute' : 'minutes'}` : ''}`;
      } else {
        return `${m} ${m === 1 ? 'minute' : 'minutes'}`;
      }
    }
    
    // For simple hour/minute values
    if (duration.toString().includes('hour') || duration.toString().includes('hours')) {
      return duration.toString();
    }
    
    if (duration.toString().includes('minute') || duration.toString().includes('minutes')) {
      return duration.toString();
    }
    
    // Default fallback
    return duration.toString();
  } catch (e) {
    console.error("Error formatting duration:", e);
    return duration.toString();
  }
};

/**
 * Fetch user's certificates
 */
export const fetchUserCertificates = async (userId: string): Promise<UserCertificate[]> => {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      id,
      certificate_id,
      issue_date,
      courses:course_id (
        id,
        title
      )
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error fetching certificates:", error);
    throw new Error(error.message);
  }
  
  // Format the data to match the expected structure
  return (data || []).map(cert => ({
    id: cert.id,
    userId: userId,
    courseId: cert.courses.id,
    certificateId: cert.certificate_id,
    issueDate: cert.issue_date,
    courseName: cert.courses.title
  }));
};

/**
 * Enroll user in a course
 */
export const enrollUserInCourse = async (userId: string, courseId: string, hasPaid: boolean = false) => {
  const { data, error } = await supabase
    .from('user_courses')
    .insert([
      { 
        user_id: userId, 
        course_id: courseId,
        has_paid: hasPaid,
        progress_percentage: 0 
      }
    ])
    .select();
  
  if (error) {
    console.error("Error enrolling user in course:", error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Update user's lesson progress
 */
export const updateLessonProgress = async (
  userId: string, 
  lessonId: string, 
  courseId: string,
  completed: boolean,
  lastPosition?: string
) => {
  // Check if a record exists first
  const { data: existingProgress } = await supabase
    .from('user_lesson_progress')
    .select()
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  
  if (existingProgress) {
    // Update existing record
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .update({ 
        completed, 
        last_position: lastPosition,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .select();
    
    if (error) {
      console.error("Error updating lesson progress:", error);
      throw new Error(error.message);
    }
    
    return data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .insert([{ 
        user_id: userId, 
        lesson_id: lessonId,
        course_id: courseId,
        completed,
        last_position: lastPosition,
        completed_at: completed ? new Date().toISOString() : null
      }])
      .select();
    
    if (error) {
      console.error("Error inserting lesson progress:", error);
      throw new Error(error.message);
    }
    
    return data;
  }
};

/**
 * Calculate and update course progress
 */
export const updateCourseProgress = async (userId: string, courseId: string) => {
  // Get total lessons for the course
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId);
  
  if (lessonsError) {
    console.error("Error fetching lessons:", lessonsError);
    throw new Error(lessonsError.message);
  }
  
  // Get completed lessons
  const { data: completedLessons, error: progressError } = await supabase
    .from('user_lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true);
  
  if (progressError) {
    console.error("Error fetching completed lessons:", progressError);
    throw new Error(progressError.message);
  }
  
  // Calculate progress percentage
  const totalLessons = lessons?.length || 0;
  const completedCount = completedLessons?.length || 0;
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedCount / totalLessons) * 100) 
    : 0;
  
  // If all lessons are completed, mark the course as completed
  if (progressPercentage === 100) {
    await supabase
      .from('user_courses')
      .update({ 
        progress_percentage: progressPercentage,
        is_completed: true,
        last_accessed: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
  } else {
    await supabase
      .from('user_courses')
      .update({ 
        progress_percentage: progressPercentage,
        last_accessed: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
  }
  
  const { data, error } = await supabase
    .from('user_courses')
    .select()
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  
  if (error) {
    console.error("Error updating course progress:", error);
    throw new Error(error.message);
  }
  
  return data;
};
