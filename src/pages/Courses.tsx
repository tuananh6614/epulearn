
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
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

// Function to generate a random color
const getRandomColor = () => {
  const colors = ['#4F46E5', '#10B981', '#3B82F6', '#D946EF', '#F59E0B'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Courses = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching courses:', error);
          toast({
            description: "Đã xảy ra lỗi khi tải dữ liệu.",
            action: {
              label: "Thử lại",
              onClick: () => fetchCourses()
            },
          });
          return;
        }
        
        // Transform the data to match our Course model
        const formattedCourses: Course[] = data.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          image: course.thumbnail_url || '/placeholder.jpg',
          category: course.category,
          duration: course.duration,
          level: course.level,
          is_premium: course.is_premium,
          isPremium: course.is_premium,
          is_featured: course.is_featured,
          isFeatured: course.is_featured,
          instructor: course.instructor,
          created_at: course.created_at,
          updated_at: course.updated_at,
          status: 'published', // Setting default status
          price: course.price?.toString() || '',
          discount_price: course.discount_price?.toString() || '',
          discountPrice: course.discount_price?.toString() || '',
          color: getRandomColor(),
          chapters: []
        }));
        
        setAllCourses(formattedCourses);
        setFilteredCourses(formattedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
