
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from '@/services/apiUtils';
import { Course, SupabaseCourseResponse } from '@/models/lesson';
import { Crown } from 'lucide-react';

const VipCourses = () => {
  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['vipCourses'],
    queryFn: async () => {
      const courses = await fetchCourses();
      return courses.filter((course: SupabaseCourseResponse) => course.is_premium);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="bg-gray-200 dark:bg-gray-700 animate-pulse h-80 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                Không thể tải danh sách khóa học VIP
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Vui lòng thử lại sau
              </p>
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
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Khóa Học VIP</h1>
          </div>
          
          {coursesData && coursesData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {coursesData.map((course: SupabaseCourseResponse) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  level={course.level}
                  duration={course.duration}
                  category={course.category}
                  image={course.thumbnail_url || '/placeholder.svg'}
                  color="#ffd700"
                  isPremium={true}
                  price={course.price || undefined}
                  discountPrice={course.discount_price || undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chưa có khóa học VIP nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Vui lòng quay lại sau
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VipCourses;
