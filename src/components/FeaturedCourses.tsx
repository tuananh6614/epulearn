
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CourseCard from './CourseCard';
import { Link } from "react-router-dom";

// Dữ liệu các khóa học nổi bật
const featuredCourses = [
  {
    id: "html-basics",
    title: "HTML Cơ Bản",
    description: "Học những kiến thức nền tảng của HTML để tạo trang web có cấu trúc",
    level: "Người Mới",
    chapters: 8,
    duration: "4 tuần",
    category: "Phát Triển Web",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #48BB78 0%, #38A169 100%)"
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
    color: "linear-gradient(90deg, #4299E1 0%, #3182CE 100%)"
  },
  {
    id: "js-basics",
    title: "JavaScript Nền Tảng",
    description: "Xây dựng ứng dụng web tương tác với JavaScript",
    level: "Trung Cấp",
    chapters: 12,
    duration: "6 tuần",
    category: "Lập Trình",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #ECC94B 0%, #D69E2E 100%)"
  },
  {
    id: "python-basics",
    title: "Python Cơ Bản",
    description: "Bắt đầu với lập trình Python dành cho người mới",
    level: "Người Mới",
    chapters: 10,
    duration: "5 tuần",
    category: "Lập Trình",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #667EEA 0%, #764BA2 100%)"
  }
];

// Component hiển thị các khóa học nổi bật
const FeaturedCourses = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <div>
            <h2 className="text-3xl font-bold text-epu-dark mb-2">Khóa Học Nổi Bật</h2>
            <p className="text-gray-600 max-w-2xl">Khám phá các khóa học lập trình phổ biến nhất của chúng tôi và bắt đầu hành trình học code ngay hôm nay.</p>
          </div>
          <Button variant="link" className="text-epu-blue hover-lift" asChild>
            <Link to="/courses" className="flex items-center">
              Xem tất cả khóa học <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
