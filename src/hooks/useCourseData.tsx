
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { enrollUserInCourse } from '@/integrations/supabase/apiUtils';

// Cache for courses to reduce unnecessary fetches
const courseCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_DURATION = 120000; // 2 minutes

// Helper hook to get course content with progress for the current user
export const useCourseData = (courseId: string | undefined) => {
  const [courseData, setCourseData] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, currentUser } = useAuth();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check cache first
        const now = Date.now();
        const cached = courseCache.get(courseId);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
          console.log('Using cached course data for', courseId);
          setCourseData(cached.data);
          
          // Still need to fetch user-specific progress data
          if (user) {
            await fetchUserProgress(courseId, user.id);
          } else {
            setLoading(false);
          }
          return;
        }
        
        console.log('Fetching course details for', courseId);
        
        // Fetch course details
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) {
          console.error('Error fetching course:', courseError);
          throw courseError;
        }

        console.log('Course data received:', course ? course.title : 'No course found');

        // Fetch chapters
        const { data: chapters, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (chaptersError) {
          console.error('Error fetching chapters:', chaptersError);
          throw chaptersError;
        }

        // Fetch lessons
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError);
          throw lessonsError;
        }

        // Check VIP access for premium courses
        let userCanAccess = true;
        if (course.is_premium && user) {
          userCanAccess = currentUser?.isVip || false;
          console.log('Course is premium, user VIP status:', userCanAccess);
        }

        // Structure the data
        const structuredData = {
          ...course,
          chapters: chapters.map((chapter) => ({
            ...chapter,
            lessons: lessons.filter((lesson) => lesson.chapter_id === chapter.id)
          })),
          userCanAccess
        };

        // Cache the course data
        courseCache.set(courseId, {
          data: structuredData,
          timestamp: now
        });

        console.log('Course data structured with chapters:', chapters?.length || 0);
        setCourseData(structuredData);
        
        // Check enrollment status if user is logged in
        if (user) {
          await fetchUserProgress(courseId, user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err as Error);
        toast.error("Không thể tải dữ liệu khóa học");
        setLoading(false);
      }
    };
    
    const fetchUserProgress = async (courseId: string, userId: string) => {
      try {
        console.log('Checking enrollment for user:', userId, 'course:', courseId);
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('user_courses')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          console.error('Error checking enrollment:', enrollmentError);
          throw enrollmentError;
        }

        setIsEnrolled(!!enrollment);
        setUserProgress(enrollment?.progress_percentage || 0);
        console.log('User progress:', enrollment?.progress_percentage || 0, 'Enrolled:', !!enrollment);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user progress:', error);
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user, currentUser]);

  // Enrollment function
  const enrollInCourse = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học");
      return { success: false };
    }

    if (!courseId) {
      return { success: false };
    }

    // Check if course is premium and user is not VIP
    if (courseData?.is_premium && !currentUser?.isVip) {
      toast.error("Bạn cần đăng ký gói VIP để truy cập khóa học này");
      return { success: false, requiresVip: true };
    }

    try {
      console.log('Enrolling user in course:', courseId);
      const result = await enrollUserInCourse(user.id, courseId);
      
      if (result.success) {
        setIsEnrolled(true);
        setUserProgress(0);
        toast.success("Đăng ký khóa học thành công");
        console.log('Enrollment successful');
      } else {
        console.error('Error enrolling in course:', result.error);
        toast.error("Không thể đăng ký khóa học: " + (result.error?.message || ""));
      }
      
      return result;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error("Không thể đăng ký khóa học");
      return { success: false, error };
    }
  };

  // Clear course cache
  const clearCourseCache = () => {
    courseCache.delete(courseId || '');
    console.log('Course cache cleared for:', courseId);
  };

  return {
    courseData,
    userProgress,
    isEnrolled,
    loading,
    error,
    enrollInCourse,
    clearCourseCache
  };
};
