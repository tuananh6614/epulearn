
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UseCourseProgressProps {
  courseId: string | undefined;
}

interface CourseProgressData {
  enrolled: boolean;
  progress: number;
  lastAccessed: string | null;
  loading: boolean;
  error: Error | null;
}

export const useCourseProgress = ({ courseId }: UseCourseProgressProps): CourseProgressData & {
  enrollInCourse: () => Promise<boolean>;
} => {
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastAccessed, setLastAccessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!user || !courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Check if user is enrolled in the course
        const { data, error: enrollmentError } = await supabase
          .from('user_courses')
          .select('progress_percentage, last_accessed')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is expected if not enrolled
          console.error('Error checking enrollment:', enrollmentError);
          setError(enrollmentError);
        }

        if (data) {
          setEnrolled(true);
          setProgress(data.progress_percentage || 0);
          setLastAccessed(data.last_accessed);
        } else {
          setEnrolled(false);
          setProgress(0);
          setLastAccessed(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in progress hook:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    checkEnrollmentStatus();
  }, [user, courseId]);

  const enrollInCourse = async (): Promise<boolean> => {
    if (!user || !courseId) {
      return false;
    }

    try {
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
        throw enrollError;
      }

      setEnrolled(true);
      setProgress(0);
      setLastAccessed(new Date().toISOString());
      
      return true;
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    }
  };

  return {
    enrolled,
    progress,
    lastAccessed,
    loading,
    error,
    enrollInCourse
  };
};
