import { supabase } from '@/integrations/supabase/client';
import { SupabaseCourseResponse } from '@/models/lesson';

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

// Enhanced cache structure with improved performance
const cache = {
  enrolledCourses: new Map<string, { data: EnrolledCourse[], timestamp: number }>(),
  courses: { data: null as SupabaseCourseResponse[] | null, timestamp: 0 },
  featuredCourses: { data: null as SupabaseCourseResponse[] | null, timestamp: 0 },
  vipCourses: { data: null as SupabaseCourseResponse[] | null, timestamp: 0 },
  certificates: new Map<string, { data: UserCertificate[], timestamp: number }>(),
  CACHE_TIME: 120000, // Increasing cache time to 2 minutes for better performance
  pendingRequests: new Map<string, Promise<any>>(), // Add tracking for in-flight requests
};

// Hàm kiểm tra cache có hợp lệ không
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < cache.CACHE_TIME;
};

// Function to prevent duplicate in-flight requests
const deduplicateRequest = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  // If there's already a pending request for this key, return it
  if (cache.pendingRequests.has(cacheKey)) {
    return cache.pendingRequests.get(cacheKey) as Promise<T>;
  }

  // Otherwise, create a new request and store it
  const promise = fetchFn().finally(() => {
    // Remove from pending requests when done
    cache.pendingRequests.delete(cacheKey);
  });

  cache.pendingRequests.set(cacheKey, promise);
  return promise;
};

// Optimized function with better error handling and retry logic
export const fetchUserEnrolledCourses = async (userId: string): Promise<EnrolledCourse[]> => {
  try {
    if (!userId) {
      console.log('No user ID provided for fetching enrolled courses');
      return [];
    }

    // Kiểm tra cache
    const cachedData = cache.enrolledCourses.get(userId);
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      console.log('Using cached enrolled courses data');
      return cachedData.data;
    }

    // Use deduplication for concurrent requests
    return await deduplicateRequest(`enrolledCourses-${userId}`, async () => {
      console.log('Fetching enrolled courses for user:', userId);

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
        console.log('No enrolled courses found for user:', userId);
        return [];
      }

      console.log('Successfully fetched enrolled courses:', data.length);

      // Transform data to EnrolledCourse format with optimized mapping
      const enrolledCourses = data.map(item => {
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
      
      // Lưu cache
      cache.enrolledCourses.set(userId, {
        data: enrolledCourses,
        timestamp: Date.now()
      });
      
      return enrolledCourses;
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};

// Function to fetch courses - optimized with specific column selection
export const fetchCourses = async (): Promise<SupabaseCourseResponse[]> => {
  try {
    // Kiểm tra cache
    if (cache.courses.data && isCacheValid(cache.courses.timestamp)) {
      console.log('Using cached courses data');
      return cache.courses.data;
    }
    
    return await deduplicateRequest('courses', async () => {
      console.log('Fetching courses from Supabase');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }

      console.log('Supabase returned data:', data ? data.length : 0, 'courses');
      
      if (!data || data.length === 0) {
        console.warn('No courses found in database');
        return [];
      }

      // Transform the data to match SupabaseCourseResponse
      const formattedCourses = data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnail_url: course.thumbnail_url || null,
        category: course.category || 'General',
        level: course.level || 'Beginner',
        duration: course.duration || '0h',
        is_premium: course.is_premium || false,
        is_featured: course.is_featured || false, 
        created_at: course.created_at,
        updated_at: course.updated_at || course.created_at, 
        status: 'published',
        instructor: course.instructor || 'EPU Learning',
        price: course.is_premium ? '299.000₫' : '0₫', 
        discount_price: course.is_premium ? '149.000₫' : null,
        full_description: course.full_description || '',
        objectives: course.objectives || [],
        requirements: course.requirements || []
      }));
      
      // Lưu cache
      cache.courses = {
        data: formattedCourses,
        timestamp: Date.now()
      };
      
      return formattedCourses;
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

// Optimized function to fetch VIP courses
export const fetchVipCourses = async (): Promise<SupabaseCourseResponse[]> => {
  try {
    // Kiểm tra cache
    if (cache.vipCourses.data && isCacheValid(cache.vipCourses.timestamp)) {
      console.log('Using cached VIP courses data');
      return cache.vipCourses.data;
    }
    
    return await deduplicateRequest('vipCourses', async () => {
      console.log('Fetching VIP courses from Supabase');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_premium', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching VIP courses:', error);
        throw error;
      }

      console.log('Supabase returned VIP data:', data ? data.length : 0, 'VIP courses');
      
      if (!data) {
        console.warn('No VIP courses found in database');
        return [];
      }

      // Transform the data to match SupabaseCourseResponse
      const formattedCourses = data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnail_url: course.thumbnail_url || null,
        category: course.category || 'General',
        level: course.level || 'Beginner',
        duration: course.duration || '0h',
        is_premium: true,
        is_featured: course.is_featured || false, 
        created_at: course.created_at,
        updated_at: course.updated_at || course.created_at,
        status: 'published',
        instructor: course.instructor || 'EPU Learning',
        price: '299.000₫', 
        discount_price: '149.000₫',
        full_description: course.full_description || '',
        objectives: course.objectives || [],
        requirements: course.requirements || []
      }));
      
      // Lưu cache
      cache.vipCourses = {
        data: formattedCourses,
        timestamp: Date.now()
      };
      
      console.log('Processed VIP courses:', formattedCourses.length);
      return formattedCourses;
    });
  } catch (error) {
    console.error('Error fetching VIP courses:', error);
    return [];
  }
};

// Function to fetch featured courses - optimized with only needed fields
export const fetchFeaturedCourses = async (): Promise<SupabaseCourseResponse[]> => {
  try {
    // Kiểm tra cache
    if (cache.featuredCourses.data && isCacheValid(cache.featuredCourses.timestamp)) {
      console.log('Using cached featured courses data');
      return cache.featuredCourses.data;
    }
    
    return await deduplicateRequest('featuredCourses', async () => {
      console.log('Fetching featured courses from Supabase');
      
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

      console.log('Supabase returned data:', data ? data.length : 0, 'featured courses');

      if (!data || data.length === 0) {
        console.warn('No featured courses found in database');
        return [];
      }

      // Transform the data to match SupabaseCourseResponse
      const formattedCourses = data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnail_url: course.thumbnail_url || null,
        category: course.category || 'General',
        level: course.level || 'Beginner',
        duration: course.duration || '0h',
        is_premium: course.is_premium || false,
        is_featured: true, 
        created_at: course.created_at,
        updated_at: course.updated_at || course.created_at,
        status: 'published',
        instructor: course.instructor || 'EPU Learning',
        price: course.is_premium ? '299.000₫' : '0₫',
        discount_price: course.is_premium ? '149.000₫' : null,
        full_description: course.full_description || '',
        objectives: course.objectives || [],
        requirements: course.requirements || []
      }));
      
      // Lưu cache
      cache.featuredCourses = {
        data: formattedCourses,
        timestamp: Date.now()
      };
      
      return formattedCourses;
    });
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
    
    // Kiểm tra cache
    const cachedData = cache.certificates.get(userId);
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
    
    return await deduplicateRequest(`certificates-${userId}`, async () => {
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

      const certificates = data?.map(cert => ({
        id: cert.id,
        userId: cert.user_id,
        courseId: cert.course_id,
        certificateId: cert.certificate_id,
        issueDate: cert.issue_date,
        courseName: cert.courses?.title || 'Unknown Course'
      })) || [];
      
      // Lưu cache
      cache.certificates.set(userId, {
        data: certificates,
        timestamp: Date.now()
      });
      
      return certificates;
    });
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
    return await deduplicateRequest('certificationPrograms', async () => {
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
    });
  } catch (error) {
    console.error('Error fetching certification programs:', error);
    return [];
  }
};

// Xóa cache
export const clearCache = () => {
  cache.enrolledCourses.clear();
  cache.courses.data = null;
  cache.courses.timestamp = 0;
  cache.featuredCourses.data = null;
  cache.featuredCourses.timestamp = 0;
  cache.vipCourses.data = null;
  cache.vipCourses.timestamp = 0;
  cache.certificates.clear();
  cache.pendingRequests.clear();
  console.log('Cache cleared');
};
