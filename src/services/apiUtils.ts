
import { supabase } from '@/integrations/supabase/client';
import { SupabaseCourseResponse as ModelSupabaseCourseResponse } from '@/models/lesson';

// Re-export the interface from models/lesson to avoid duplication
export type { SupabaseCourseResponse } from '@/models/lesson';

export interface UserCertificate {
  id: string;
  userId: string;
  courseId: string;
  certificateId: string;
  issueDate: string;
  courseName: string;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
  progress: number;
  isCompleted: boolean;
  lastAccessed: string;
  enrolledAt: string;
  status: string;
}

// Performance-optimized function to fetch user enrolled courses
export const fetchUserEnrolledCourses = async (userId: string): Promise<EnrolledCourse[]> => {
  try {
    if (!userId) {
      return [];
    }

    // Use an optimized single JOIN query with specific column selection
    const { data, error } = await supabase
      .from('user_courses')
      .select(`
        course_id,
        progress_percentage,
        last_accessed,
        enrolled_at,
        has_paid,
        course:courses(id, title, description, thumbnail_url, category)
      `)
      .eq('user_id', userId)
      .order('last_accessed', { ascending: false });

    if (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform data to EnrolledCourse format with optimized mapping
    return data.map(item => {
      const isCompleted = item.progress_percentage >= 100;
      
      // Special handling for VIP courses with early return pattern
      if (typeof item.course_id === 'string' && item.course_id.startsWith('vip-')) {
        const duration = item.course_id.split('vip-')[1];
        const durationMap: Record<string, string> = {
          '1-month': '1 tháng',
          '3-months': '3 tháng',
          '6-months': '6 tháng',
          '1-year': '1 năm'
        };
        
        return {
          id: item.course_id,
          title: `Gói VIP ${durationMap[duration] || duration}`,
          description: `Gói VIP đăng ký ${durationMap[duration] || duration}`,
          image: '/public/vip-badge.png',
          color: 'yellow',
          progress: 100,
          isCompleted: true,
          lastAccessed: item.last_accessed,
          enrolledAt: item.enrolled_at,
          status: item.has_paid ? 'published' : 'draft'
        };
      }
      
      // Handle regular courses
      if (item.course) {
        return {
          id: item.course_id,
          title: item.course.title,
          description: item.course.description || '',
          image: item.course.thumbnail_url || '/placeholder.svg',
          color: item.course.category === 'JavaScript' ? 'yellow' : 
                 item.course.category === 'React' ? 'blue' : 
                 item.course.category === 'Node' ? 'green' : 'gray',
          progress: item.progress_percentage,
          isCompleted,
          lastAccessed: item.last_accessed,
          enrolledAt: item.enrolled_at,
          status: 'published'
        };
      }
      
      // Fallback for undefined courses
      return {
        id: item.course_id,
        title: 'Khóa học không xác định',
        description: 'Khóa học này không còn tồn tại',
        image: '/placeholder.svg',
        color: 'gray',
        progress: item.progress_percentage,
        isCompleted,
        lastAccessed: item.last_accessed,
        enrolledAt: item.enrolled_at,
        status: 'archived'
      };
    });
    
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};

// Function to fetch courses - optimized with specific column selection
export const fetchCourses = async (): Promise<ModelSupabaseCourseResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, thumbnail_url, category, level, duration, is_premium, is_featured, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }

    return data?.map(course => ({
      ...course,
      thumbnail_url: course.thumbnail_url || null,
      status: 'published'
    })) || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

// Function to fetch featured courses - optimized with only needed fields
export const fetchFeaturedCourses = async (): Promise<ModelSupabaseCourseResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, thumbnail_url, category, level, duration, is_premium, created_at')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching featured courses:', error);
      throw error;
    }

    return data?.map(course => ({
      ...course,
      thumbnail_url: course.thumbnail_url || null,
      status: 'published'
    })) || [];
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    return [];
  }
};

// Function to fetch user certificates - optimized join query
export const fetchUserCertificates = async (userId: string): Promise<UserCertificate[]> => {
  try {
    if (!userId) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        id, user_id, course_id, certificate_id, issue_date,
        courses(title)
      `)
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }

    return data?.map(cert => ({
      id: cert.id,
      userId: cert.user_id,
      courseId: cert.course_id,
      certificateId: cert.certificate_id,
      issueDate: cert.issue_date,
      courseName: cert.courses?.title || 'Unknown Course'
    })) || [];
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
};

// Function to check API health
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('API health check error:', error);
    return false;
  }
};

// Optimized function to fetch certification programs
export const fetchCertificationPrograms = async () => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, duration, level, category')
      .eq('is_premium', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching certification programs:', error);
      throw error;
    }

    return data?.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      requirements: [
        `Kiến thức cơ bản về ${course.category}`,
        `Hoàn thành tất cả các bài học trong khóa học`,
        `Đạt điểm tối thiểu 80% trong bài kiểm tra cuối khóa`
      ]
    })) || [];
  } catch (error) {
    console.error('Error fetching certification programs:', error);
    return [];
  }
};
