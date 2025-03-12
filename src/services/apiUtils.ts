
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseCourseResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  thumbnail_url?: string;
  category?: string;
  created_at?: string;
  is_featured?: boolean;
}

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

// Function to fetch user enrolled courses
export const fetchUserEnrolledCourses = async (userId: string): Promise<EnrolledCourse[]> => {
  try {
    if (!userId) {
      return [];
    }

    // Use a single JOIN query instead of multiple separate queries
    const { data, error } = await supabase
      .from('user_courses')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform data to EnrolledCourse format with more efficient async handling
    return data.map(item => {
      const isCompleted = item.progress_percentage >= 100;
      
      // Special handling for VIP courses
      if (item.course_id.startsWith('vip-')) {
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

// Function to fetch courses
export const fetchCourses = async (): Promise<SupabaseCourseResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

// Function to fetch featured courses
export const fetchFeaturedCourses = async (): Promise<SupabaseCourseResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching featured courses:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    return [];
  }
};

// Function to fetch user certificates
export const fetchUserCertificates = async (userId: string): Promise<UserCertificate[]> => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses(title)
      `)
      .eq('user_id', userId);

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
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    return !error;
  } catch (error) {
    console.error('API health check error:', error);
    return false;
  }
};
