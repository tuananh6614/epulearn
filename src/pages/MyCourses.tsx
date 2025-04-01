import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from '@/components/CourseCard';
import { Loader2 } from "lucide-react";
import Navbar from '@/components/Navbar';
import { Course } from '@/models/lesson';
import { supabaseId } from '@/utils/idConverter';

const MyCourses = () => {
  const [courses, setCourses] = useState<
    Course[] & {
      progress: number;
      isCompleted: boolean;
      lastAccessed: string;
      enrolledAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('user_courses')
          .select(`
            *,
            courses (
              *
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching enrolled courses:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const enrolledCourses = data.map((item) => ({
            id: item.course_id,
            title: item.courses?.title || 'Unknown Course',
            description: item.courses?.description || '',
            image: item.courses?.thumbnail_url || item.courses?.image || '/placeholder.svg',
            thumbnail_url: item.courses?.thumbnail_url || '/placeholder.svg',
            level: item.courses?.level || 'Beginner',
            duration: item.courses?.duration || 'Unknown',
            category: item.courses?.category || 'General',
            isPremium: item.courses?.is_premium || false,
            is_premium: item.courses?.is_premium || false,
            price: item.courses?.price || 'Free',
            discountPrice: item.courses?.discount_price || item.courses?.discount_price,
            discount_price: item.courses?.discount_price || item.courses?.discount_price,
            progress: item.progress_percentage || 0,
            lastAccessed: item.last_accessed || 'Never',
            enrolledAt: item.created_at || 'Unknown',
            status: item.courses?.status || 'published',
            chapters: item.courses?.chapters || [],
            isCompleted: item.progress_percentage === 100,
            color: '#4F46E5'
          }));
          setCourses(enrolledCourses as any);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  const renderCourseCards = (courses: Course[]) => {
    return courses.map((course) => (
      <CourseCard
        key={supabaseId(course.id)}
        id={supabaseId(course.id)}
        title={course.title}
        description={course.description}
        image={course.image || course.thumbnail_url || '/placeholder.svg'}
        level={course.level}
        duration={course.duration}
        category={course.category}
        isPremium={course.isPremium || course.is_premium}
        price={course.price}
        discountPrice={course.discountPrice || course.discount_price}
        progress={course.progress}
        lastAccessed={course.lastAccessed}
        enrolledAt={course.enrolledAt}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      <div className="container max-w-6xl py-8">
        <h1 className="text-3xl font-bold mb-6">Khóa Học Của Tôi</h1>
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderCourseCards(courses)}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-8">
              Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học của chúng
              tôi ngay hôm nay!
            </p>
            {/* <Button asChild>
              <Link to="/courses">Khám phá khóa học</Link>
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
