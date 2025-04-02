
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CourseCard from './CourseCard';
import { Link } from "react-router-dom";
import { Course } from '@/models/lesson';

// Function to generate a random color
const getRandomColor = () => {
  const colors = ['#4F46E5', '#10B981', '#3B82F6', '#D946EF', '#F59E0B'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Mock featured courses data
const mockFeaturedCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the basics of web development with HTML, CSS and JavaScript',
    thumbnail_url: '/placeholder.jpg',
    image: '/placeholder.jpg',
    category: 'Development',
    duration: '24 hours',
    level: 'Beginner',
    is_premium: false,
    isPremium: false,
    is_featured: true,
    isFeatured: true,
    instructor: 'John Doe',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'published',
    price: '',
    discount_price: '',
    discountPrice: '',
    color: getRandomColor(),
    chapters: []
  },
  {
    id: '2',
    title: 'Advanced React Development',
    description: 'Master advanced React concepts including hooks, context API and Redux',
    thumbnail_url: '/placeholder.jpg',
    image: '/placeholder.jpg',
    category: 'Development',
    duration: '32 hours',
    level: 'Advanced',
    is_premium: true,
    isPremium: true,
    is_featured: true,
    isFeatured: true,
    instructor: 'Jane Smith',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'published',
    price: '99.99',
    discount_price: '79.99',
    discountPrice: '79.99',
    color: getRandomColor(),
    chapters: []
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of effective UI/UX design',
    thumbnail_url: '/placeholder.jpg',
    image: '/placeholder.jpg',
    category: 'Design',
    duration: '18 hours',
    level: 'Intermediate',
    is_premium: false,
    isPremium: false,
    is_featured: true,
    isFeatured: true,
    instructor: 'Alex Johnson',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'published',
    price: '',
    discount_price: '',
    discountPrice: '',
    color: getRandomColor(),
    chapters: []
  },
  {
    id: '4',
    title: 'Digital Marketing Essentials',
    description: 'Learn the fundamentals of digital marketing strategies',
    thumbnail_url: '/placeholder.jpg',
    image: '/placeholder.jpg',
    category: 'Marketing',
    duration: '15 hours',
    level: 'Beginner',
    is_premium: true,
    isPremium: true,
    is_featured: true,
    isFeatured: true,
    instructor: 'Sarah Williams',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'published',
    price: '59.99',
    discount_price: '49.99',
    discountPrice: '49.99',
    color: getRandomColor(),
    chapters: []
  },
];

const FeaturedCourses = () => {
  const featuredCourses = mockFeaturedCourses;

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 relative">
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Khóa Học</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
              Khám phá các khóa học lập trình phổ biến của chúng tôi và bắt đầu hành trình học code ngay hôm nay.
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
              <CourseCard 
                key={String(course.id)} 
                id={String(course.id)}
                title={course.title}
                description={course.description}
                level={course.level}
                duration={course.duration}
                category={course.category}
                image={course.image || ''}
                isPremium={course.isPremium || false}
                price={course.price}
                discountPrice={course.discountPrice}
                color={course.color}
              />
            ))
          ) : (
            <p className="col-span-4 text-center text-gray-500 dark:text-gray-400 py-10">Không có khóa học nào. Vui lòng quay lại sau.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
