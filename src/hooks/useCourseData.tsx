
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { enrollUserInCourse } from '@/integrations/supabase/apiUtils';

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

        // Check enrollment status if user is logged in
        if (user) {
          const { data: enrollment, error: enrollmentError } = await supabase
            .from('user_courses')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();

          if (enrollmentError && enrollmentError.code !== 'PGRST116') {
            console.error('Error checking enrollment:', enrollmentError);
            throw enrollmentError;
          }

          setIsEnrolled(!!enrollment);
          setUserProgress(enrollment?.progress_percentage || 0);
        }

        // Check VIP access for premium courses
        let userCanAccess = true;
        if (course.is_premium && user) {
          userCanAccess = currentUser?.isVip || false;
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

        setCourseData(structuredData);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err as Error);
        toast.error("Không thể tải dữ liệu khóa học");
      } finally {
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
      const result = await enrollUserInCourse(user.id, courseId);
      
      if (result.success) {
        setIsEnrolled(true);
        setUserProgress(0);
        toast.success("Đăng ký khóa học thành công");
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

  return {
    courseData,
    userProgress,
    isEnrolled,
    loading,
    error,
    enrollInCourse
  };
};
