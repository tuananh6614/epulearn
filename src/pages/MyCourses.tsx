import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnrolledCourse } from '@/models/lesson';
import { fetchUserEnrolledCourses } from '@/services/apiUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's enrolled courses from Supabase
    const loadCourses = async () => {
      setLoading(true);
      
      try {
        if (currentUser) {
          console.log('Fetching enrolled courses for user:', currentUser.id);
          const courses = await fetchUserEnrolledCourses(currentUser.id);
          setEnrolledCourses(courses);
        } else {
          setEnrolledCourses([]);
          toast.error("Vui lòng đăng nhập để xem khóa học của bạn");
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setEnrolledCourses([]);
        toast.error("Không thể tải khóa học đã đăng ký");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4 mb-12"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-72 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCourseClick = (courseId: string | number) => {
    navigate(`/course/${courseId}/start`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Khóa Học Của Tôi</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Tiếp tục học tập với các khóa học bạn đã đăng ký.
          </p>
          
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={String(course.id)}
                  className="col-span-1"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CourseCard 
                    key={course.id} 
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    level={course.level || 'Cơ bản'}
                    duration={course.duration || ''}
                    category={course.category || ''}
                    image={course.image}
                    color={course.color}
                    isPremium={course.isPremium}
                    price={course.price}
                    discountPrice={course.discountPrice}
                  />
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tiến độ</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Bạn chưa đăng ký khóa học nào</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Hãy khám phá các khóa học và bắt đầu hành trình học tập của bạn.
              </p>
              <Button asChild>
                <Link to="/courses">Khám Phá Khóa Học</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyCourses;
