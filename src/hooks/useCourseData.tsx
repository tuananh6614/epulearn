
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { enrollUserInCourse } from '@/integrations/supabase/apiUtils';
import { useRealtimeSubscription } from './useRealtimeSubscription';

// Cache for courses to reduce unnecessary fetches
const courseCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_DURATION = 120000; // 2 minutes

// Helper hook to get course content with progress for the current user
export const useCourseData = (courseId: number | undefined) => {
  const [courseData, setCourseData] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<number>(0);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, currentUser } = useAuth();

  // Fetch course data
  const fetchCourseData = useCallback(async (skipCache = false) => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check cache first
      const now = Date.now();
      const cached = courseCache.get(courseId.toString());
      if (!skipCache && cached && now - cached.timestamp < CACHE_DURATION) {
        console.log('[CourseData] Using cached course data for', courseId);
        setCourseData(cached.data);
        
        // Still need to fetch user-specific progress data
        if (user) {
          await fetchUserProgress(courseId, user.id);
        } else {
          setLoading(false);
        }
        return;
      }
      
      console.log('[CourseData] Fetching course details for', courseId);
      
      // Fetch course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('[CourseData] Error fetching course:', courseError);
        throw courseError;
      }

      console.log('[CourseData] Course data received:', course ? course.title : 'No course found');

      // Fetch chapters
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (chaptersError) {
        console.error('[CourseData] Error fetching chapters:', chaptersError);
        throw chaptersError;
      }

      // Fetch lessons with full content from Supabase
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('[CourseData] Error fetching lessons:', lessonsError);
        throw lessonsError;
      }

      // Check VIP access for premium courses
      let userCanAccess = true;
      if (course.is_premium && user) {
        userCanAccess = currentUser?.isVip || false;
        console.log('[CourseData] Course is premium, user VIP status:', userCanAccess);
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
      courseCache.set(courseId.toString(), {
        data: structuredData,
        timestamp: now
      });

      console.log('[CourseData] Course data structured with chapters:', chapters?.length || 0);
      setCourseData(structuredData);
      
      // Check enrollment status if user is logged in
      if (user) {
        await fetchUserProgress(courseId, user.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('[CourseData] Error fetching course data:', err);
      setError(err as Error);
      toast.error("Không thể tải dữ liệu khóa học");
      setLoading(false);
    }
  }, [courseId, user, currentUser]);
  
  const fetchUserProgress = async (courseId: number, userId: string) => {
    try {
      console.log('[CourseData] Checking enrollment for user:', userId, 'course:', courseId);
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (enrollmentError && enrollmentError.code !== 'PGRST116') {
        console.error('[CourseData] Error checking enrollment:', enrollmentError);
        throw enrollmentError;
      }

      setIsEnrolled(!!enrollment);
      setUserProgress(enrollment?.progress_percentage || 0);
      console.log('[CourseData] User progress:', enrollment?.progress_percentage || 0, 'Enrolled:', !!enrollment);
      setLoading(false);
    } catch (error) {
      console.error('[CourseData] Error fetching user progress:', error);
      setLoading(false);
    }
  };
  
  // Subscribe to realtime updates for the current course
  useRealtimeSubscription({
    table: 'courses',
    event: 'UPDATE',
    filter: `id=eq.${courseId}`,
    onDataChange: (payload) => {
      console.log('[CourseData] Realtime course update detected:', payload);
      if (payload.new && payload.new.id === courseId) {
        // Only update specific fields from the course object
        if (courseData) {
          setCourseData(prev => ({
            ...prev,
            title: payload.new.title,
            description: payload.new.description,
            is_premium: payload.new.is_premium,
            is_featured: payload.new.is_featured,
            // Giữ nguyên các thông tin chapters đã tải trước đó
          }));
        } else {
          // If no data yet, fetch all
          fetchCourseData(true);
        }
      }
    }
  });
  
  // Subscribe to realtime updates for user progress
  useRealtimeSubscription({
    table: 'user_courses',
    userId: user?.id,
    filter: user?.id && courseId ? `user_id=eq.${user.id}&course_id=eq.${courseId}` : undefined,
    onDataChange: (payload) => {
      console.log('[CourseData] Realtime user progress update detected:', payload);
      if (payload.new && payload.new.user_id === user?.id && payload.new.course_id === courseId) {
        setIsEnrolled(true);
        setUserProgress(payload.new.progress_percentage || 0);
      }
    }
  });

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

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
      console.log('[CourseData] Enrolling user in course:', courseId);
      const result = await enrollUserInCourse(user.id, courseId);
      
      if (result.success) {
        setIsEnrolled(true);
        setUserProgress(0);
        toast.success("Đăng ký khóa học thành công");
        console.log('[CourseData] Enrollment successful');
      } else {
        console.error('[CourseData] Error enrolling in course:', result.error);
        toast.error("Không thể đăng ký khóa học: " + (result.error?.message || ""));
      }
      
      return result;
    } catch (error) {
      console.error('[CourseData] Error enrolling in course:', error);
      toast.error("Không thể đăng ký khóa học");
      return { success: false, error };
    }
  };

  // Clear course cache
  const clearCourseCache = () => {
    courseCache.delete(courseId?.toString() || '');
    console.log('[CourseData] Course cache cleared for:', courseId);
  };

  return {
    courseData,
    userProgress,
    isEnrolled,
    loading,
    error,
    enrollInCourse,
    clearCourseCache,
    refreshData: () => fetchCourseData(true)
  };
};
