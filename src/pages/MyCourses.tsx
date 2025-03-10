
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

// Dữ liệu giả lập khóa học đã đăng ký
const enrolledCoursesData = [
  {
    id: "html-basics",
    title: "HTML Cơ Bản",
    description: "Học những kiến thức nền tảng của HTML để tạo trang web có cấu trúc",
    level: "Người Mới",
    chapters: 8,
    duration: "4 tuần",
    category: "Phát Triển Web",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #48BB78 0%, #38A169 100%)",
    progress: 25
  },
  {
    id: "css-basics",
    title: "CSS Cơ Bản",
    description: "Làm chủ CSS để tạo các thiết kế web đẹp mắt",
    level: "Người Mới",
    chapters: 10,
    duration: "5 tuần",
    category: "Phát Triển Web",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #4299E1 0%, #3182CE 100%)",
    progress: 10
  }
];

const MyCourses = () => {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState(enrolledCoursesData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập load dữ liệu
    const loadCourses = () => {
      setLoading(true);
      // Trong thực tế sẽ fetch từ API
      setTimeout(() => {
        setEnrolledCourses(enrolledCoursesData);
        setLoading(false);
      }, 800);
    };

    loadCourses();
  }, []);

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
                <div key={course.id} className="flex flex-col h-full">
                  <CourseCard key={course.id} {...course} />
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
