
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Course, Lesson } from '@/models/lesson';
import { supabaseId } from '@/utils/idConverter';
import { useAuth } from '@/context/AuthContext';

export interface UseCourseDataProps {
  courseId?: string | number;
}

export const useCourseData = ({ courseId }: UseCourseDataProps) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userProgress, setUserProgress] = useState(0);
  const { user } = useAuth();

  // Fetch course data
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', supabaseId(courseId))
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const courseData: Course = {
            id: data.id,
            title: data.title,
            description: data.description,
            image: data.thumbnail_url || '/placeholder.svg',
            thumbnail_url: data.thumbnail_url,
            category: data.category,
            level: data.level,
            duration: data.duration,
            isPremium: data.is_premium,
            is_premium: data.is_premium,
            price: String(data.price || ''),
            discountPrice: String(data.discount_price || ''),
            discount_price: String(data.discount_price || ''),
            instructor: data.instructor,
            isFeatured: data.is_featured,
            is_featured: data.is_featured,
            full_description: data.full_description || data.description,
            created_at: data.created_at,
            updated_at: data.updated_at,
            status: 'published',
            objectives: data.objectives || [],
            requirements: data.requirements || []
          };

          setCourse(courseData);
          
          // Check if user is enrolled in this course
          if (user) {
            const { data: enrollmentData } = await supabase
              .from('user_courses')
              .select('*')
              .eq('user_id', user.id)
              .eq('course_id', supabaseId(courseId))
              .maybeSingle();
              
            setIsEnrolled(!!enrollmentData);
            setUserProgress(enrollmentData?.progress_percentage || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        toast.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  // Fetch lessons
  useEffect(() => {
    if (!courseId) {
      return;
    }

    const fetchLessons = async () => {
      try {
        setLoading(true);

        // First fetch chapters
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('course_id', supabaseId(courseId))
          .order('order_index', { ascending: true });

        if (chaptersError) {
          throw chaptersError;
        }

        // Then fetch lessons for each chapter
        const allLessons: Lesson[] = [];

        if (chaptersData && chaptersData.length > 0) {
          for (const chapter of chaptersData) {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .eq('chapter_id', chapter.id)
              .order('order_index', { ascending: true });

            if (lessonsError) {
              console.error('Error fetching lessons for chapter:', lessonsError);
              continue;
            }

            if (lessonsData) {
              const transformedLessons: Lesson[] = lessonsData.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                content: lesson.content,
                type: lesson.type,
                duration: lesson.duration,
                chapter_id: lesson.chapter_id,
                chapterTitle: chapter.title,
                order_index: lesson.order_index,
                course_id: lesson.course_id,
                is_premium: lesson.is_premium,
                created_at: lesson.created_at,
                updated_at: lesson.updated_at
              }));

              allLessons.push(...transformedLessons);
            }
          }
        }

        setLessons(allLessons);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        toast.error('Không thể tải danh sách bài học');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]);

  // Function to update course progress
  const updateProgress = async (lessonId: string | number, completed: boolean) => {
    // Implementation details...
    return true;
  };
  
  // Function to enroll in course
  const enrollInCourse = async () => {
    try {
      if (!user || !courseId) {
        toast.error('Bạn cần đăng nhập để đăng ký khóa học');
        return;
      }
      
      const { error } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: supabaseId(courseId),
          progress_percentage: 0,
        });
        
      if (error) {
        console.error('Error enrolling in course:', error);
        toast.error('Không thể đăng ký khóa học');
        return;
      }
      
      setIsEnrolled(true);
      toast.success('Đăng ký khóa học thành công');
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast.error('Không thể đăng ký khóa học');
    }
  };

  return {
    course,
    lessons,
    loading,
    error,
    updateProgress,
    isEnrolled,
    enrollInCourse,
    userProgress,
    courseData: course // alias for backward compatibility
  };
};

export default useCourseData;
