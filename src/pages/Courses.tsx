
import React, { useState, useEffect } from 'react';
import CourseCard from '@/components/CourseCard';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Course } from '@/models/lesson';
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

// Function to generate a random color
const getRandomColor = () => {
  const colors = ['#4F46E5', '#10B981', '#3B82F6', '#D946EF', '#F59E0B'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Mock courses data
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
    is_featured: false,
    isFeatured: false,
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
    is_featured: false,
    isFeatured: false,
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

const Courses = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    // Simulate loading from a database
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setAllCourses(mockCourses);
        setFilteredCourses(mockCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  const filterCourses = () => {
    let filtered = [...allCourses];
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }
    
    setFilteredCourses(filtered);
  };
  
  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedCategory, selectedLevel, allCourses]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      <div className="container max-w-6xl py-8">
        <h1 className="text-3xl font-bold mb-6">Khóa Học</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn thể loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thể loại</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          
          <Select onValueChange={(value) => setSelectedLevel(value === "all" ? null : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn trình độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trình độ</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
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
              color={course.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
