
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import CourseCard from './CourseCard';
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { API_URL, fetchWithTimeout } from '@/services/apiUtils';

// Component hiển thị các khóa học nổi bật
const FeaturedCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeaturedCourses = async () => {
    try {
      console.log('Fetching featured courses from API...');
      const response = await fetchWithTimeout(`${API_URL}/featured-courses`, {}, 8000);
      
      if (!response.ok) {
        throw new Error('Không thể tải khóa học nổi bật');
      }
      
      const data = await response.json();
      console.log('Featured courses data received:', data);
      setFeaturedCourses(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Lỗi khi tải khóa học nổi bật:', err);
      setError(err.message);
      setIsLoading(false);
      
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.");
    }
  };

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  // Thử lại khi gặp lỗi
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetchFeaturedCourses();
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Khóa Học Nổi Bật</h2>
              <p className="text-gray-700 dark:text-gray-300">Đang tải khóa học...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-800 animate-pulse h-80 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Khóa Học Nổi Bật</h2>
              <p className="text-gray-700 dark:text-gray-300">Không thể tải khóa học. {error}</p>
            </div>
          </div>
          <div className="flex justify-center items-center py-10">
            <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 relative">
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Khóa Học Nổi Bật</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
              Khám phá các khóa học lập trình phổ biến nhất của chúng tôi và bắt đầu hành trình học code ngay hôm nay.
            </p>
          </div>
          <Button variant="link" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover-lift" asChild>
            <Link to="/courses" className="flex items-center">
              Xem tất cả khóa học <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))
          ) : (
            <p className="col-span-4 text-center text-gray-500 dark:text-gray-400">Không có khóa học nổi bật nào.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
