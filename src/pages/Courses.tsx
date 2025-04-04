import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/components/CourseCard";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { Course } from '@/models/lesson';

const mockCourses: Course[] = [
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
    color: '#4F46E5',
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
    color: '#10B981',
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
    color: '#3B82F6',
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
    color: '#D946EF',
    chapters: []
  },
];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);

  useEffect(() => {
    const results = mockCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(results);
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Khám phá các khóa học
        </h1>
        <div className="w-full md:w-auto flex items-center border rounded-md py-2 px-3 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-500 mr-2" />
          <Input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            className="border-none shadow-none focus-visible:ring-0 dark:bg-gray-800 dark:text-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
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
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-gray-500 dark:text-gray-400 py-10">
            Không tìm thấy khóa học nào phù hợp.
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
        <Button variant="link" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover-lift" asChild>
          <Link to="/courses" className="flex items-center">
            Xem thêm khóa học <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Courses;
