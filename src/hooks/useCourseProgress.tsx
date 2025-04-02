
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { convertId } from '@/utils/idConverter';

interface UseCourseProgressProps {
  courseId?: number | string;
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
      console.log('[CourseProgress] Fetching progress data for courseId:', courseId, 'userId:', user.id);
      
      // Check cache first if not explicitly skipping it
      if (!skipCache) {
        const cacheKey = getCacheKey();
        const cached = progressCache.get(cacheKey);
        const now = Date.now();
        
        if (cached && now - cached.timestamp < CACHE_DURATION) {
          console.log('[CourseProgress] Using cached progress data');
          setEnrolled(cached.data.enrolled);
          setProgress(cached.data.progress);
          setLastAccessed(cached.data.lastAccessed);
          setLoading(false);
          return;
        }
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data based on course ID
      const mockData = {
        enrolled: courseId === '1' || courseId === '2',
        progress: courseId === '1' ? 45 : courseId === '2' ? 20 : 0,
        lastAccessed: courseId === '1' ? new Date().toISOString() : courseId === '2' ? new Date(Date.now() - 86400000).toISOString() : null
      };

      setEnrolled(mockData.enrolled);
      setProgress(mockData.progress);
      setLastAccessed(mockData.lastAccessed);
      
      // Update cache
      progressCache.set(getCacheKey(), {
        data: {
          enrolled: mockData.enrolled,
          progress: mockData.progress,
          lastAccessed: mockData.lastAccessed
        },
        timestamp: Date.now()
      });
      
      setLoading(false);
    } catch (err) {
      console.error('[CourseProgress] Error in progress hook:', err);
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
      console.log('[CourseProgress] Enrolling in course:', courseId);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
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
    } catch (error) {
      console.error('[CourseProgress] Error enrolling in course:', error);
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
