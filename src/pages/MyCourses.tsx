
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from '@/components/CourseCard';
import { Loader2 } from "lucide-react";
import Navbar from '@/components/Navbar';
import { Course } from '@/models/lesson';
import { supabaseId } from '@/utils/idConverter';

// Extended course type with progress information
interface EnrolledCourse extends Course {
  progress?: number;
  lastAccessed?: string;
  enrolledAt?: string;
}

const MyCourses = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
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
            image: item.courses?.thumbnail_url || '/placeholder.svg',
            thumbnail_url: item.courses?.thumbnail_url || '/placeholder.svg',
            level: item.courses?.level || 'Beginner',
            duration: item.courses?.duration || 'Unknown',
            category: item.courses?.category || 'General',
            isPremium: item.courses?.is_premium || false,
            is_premium: item.courses?.is_premium || false,
            price: String(item.courses?.price || 'Free'),
            discountPrice: String(item.courses?.discount_price || ''),
            discount_price: String(item.courses?.discount_price || ''),
            isFeatured: item.courses?.is_featured || false,
            is_featured: item.courses?.is_featured || false,
            instructor: item.courses?.instructor || 'EPU Learning',
            status: 'published',
            created_at: item.courses?.created_at || new Date().toISOString(),
            updated_at: item.courses?.updated_at || new Date().toISOString(),
            // Custom fields for enrolled courses
            progress: item.progress_percentage || 0,
            lastAccessed: item.last_accessed || 'Never',
            enrolledAt: item.enrolled_at || 'Unknown',
            color: '#4F46E5'
          }));
          setCourses(enrolledCourses);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  const renderCourseCards = (courses: EnrolledCourse[]) => {
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
