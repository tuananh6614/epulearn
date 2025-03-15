
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface UseCourseProgressProps {
  courseId?: string;
}

interface CourseProgressData {
  enrolled: boolean;
  progress: number;
  lastAccessed: string | null;
  loading: boolean;
  error: Error | null;
}

// Create a cache for course progress data
const progressCache = new Map<string, {
  data: { enrolled: boolean; progress: number; lastAccessed: string | null };
  timestamp: number;
}>();
const CACHE_DURATION = 60000; // 1 minute

export const useCourseProgress = ({ courseId }: UseCourseProgressProps): CourseProgressData & {
  enrollInCourse: () => Promise<boolean>;
  refreshProgress: () => Promise<void>;
} => {
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastAccessed, setLastAccessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Create a cache key based on user and course
  const getCacheKey = useCallback(() => {
    return `${user?.id || 'guest'}-${courseId || 'no-course'}`;
  }, [user, courseId]);

  const fetchProgressData = useCallback(async (skipCache = false) => {
    if (!user || !courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching progress data for courseId:', courseId, 'userId:', user.id);
      
      // Check cache first if not explicitly skipping it
      if (!skipCache) {
        const cacheKey = getCacheKey();
        const cached = progressCache.get(cacheKey);
        const now = Date.now();
        
        if (cached && now - cached.timestamp < CACHE_DURATION) {
          console.log('Using cached progress data');
          setEnrolled(cached.data.enrolled);
          setProgress(cached.data.progress);
          setLastAccessed(cached.data.lastAccessed);
          setLoading(false);
          return;
        }
      }
      
      // Check if user is enrolled in the course
      const { data, error: enrollmentError } = await supabase
        .from('user_courses')
        .select('progress_percentage, last_accessed')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (enrollmentError) {
        console.error('Error checking enrollment:', enrollmentError);
        setError(enrollmentError);
      }

      console.log('Progress data received:', data);
      
      if (data) {
        setEnrolled(true);
        setProgress(data.progress_percentage || 0);
        setLastAccessed(data.last_accessed);
      } else {
        setEnrolled(false);
        setProgress(0);
        setLastAccessed(null);
      }
      
      // Update cache
      progressCache.set(getCacheKey(), {
        data: {
          enrolled: !!data,
          progress: data?.progress_percentage || 0,
          lastAccessed: data?.last_accessed || null
        },
        timestamp: Date.now()
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error in progress hook:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast.error('Không thể kiểm tra tiến độ khóa học. Vui lòng thử lại sau.');
      setLoading(false);
    }
  }, [user, courseId, getCacheKey]);

  // Fetch progress on component mount and when dependencies change
  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // Function to refresh progress data
  const refreshProgress = async () => {
    await fetchProgressData(true);
  };

  const enrollInCourse = async (): Promise<boolean> => {
    if (!user || !courseId) {
      toast.error('Vui lòng đăng nhập để đăng ký khóa học');
      return false;
    }

    try {
      console.log('Enrolling in course:', courseId);
      
      // Add user to course
      const { error: enrollError } = await supabase
        .from('user_courses')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0,
          enrolled_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });

      if (enrollError) {
        console.error('Error enrolling in course:', enrollError);
        toast.error('Không thể đăng ký khóa học. Vui lòng thử lại sau.');
        return false;
      }

      // Update local state
      setEnrolled(true);
      setProgress(0);
      setLastAccessed(new Date().toISOString());
      
      // Update cache
      progressCache.set(getCacheKey(), {
        data: {
          enrolled: true,
          progress: 0,
          lastAccessed: new Date().toISOString()
        },
        timestamp: Date.now()
      });

      toast.success('Đã đăng ký khóa học thành công!');
      return true;
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast.error('Đã xảy ra lỗi khi đăng ký khóa học');
      return false;
    }
  };

  return {
    enrolled,
    progress,
    lastAccessed,
    loading,
    error,
    enrollInCourse,
    refreshProgress
  };
};
