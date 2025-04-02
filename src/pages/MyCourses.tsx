
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CourseCard from '@/components/CourseCard';
import { Loader2 } from "lucide-react";
import Navbar from '@/components/Navbar';
import { Course } from '@/models/lesson';

// Function to generate a random color
const getRandomColor = () => {
  const colors = ['#4F46E5', '#10B981', '#3B82F6', '#D946EF', '#F59E0B'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Extended course type with progress information
interface EnrolledCourse extends Course {
  progress?: number;
  lastAccessed?: string;
  enrolledAt?: string;
}

// Mock enrolled courses data
const mockEnrolledCourses: EnrolledCourse[] = [
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
    chapters: [],
    progress: 45,
    lastAccessed: new Date().toISOString(),
    enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
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
    chapters: [],
    progress: 20,
    lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
  }
];

const MyCourses = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (user) {
          setCourses(mockEnrolledCourses);
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
        key={String(course.id)}
        id={String(course.id)}
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
        color={course.color}
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
