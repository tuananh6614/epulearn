
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from 'lucide-react';

// Dữ liệu các khóa học
const coursesData = [
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
  },
  {
    id: "java-basics",
    title: "Java Cơ Bản",
    description: "Học lập trình hướng đối tượng với Java",
    level: "Người Mới",
    chapters: 12,
    duration: "6 tuần",
    category: "Lập Trình",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #F56565 0%, #E53E3E 100%)"
  },
  {
    id: "cpp-basics",
    title: "C++ Cơ Bản",
    description: "Làm chủ các nguyên tắc cơ bản của ngôn ngữ lập trình C++",
    level: "Trung Cấp",
    chapters: 14,
    duration: "7 tuần",
    category: "Lập Trình",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #9F7AEA 0%, #805AD5 100%)"
  },
  {
    id: "react-basics",
    title: "React.js Cơ Bản",
    description: "Xây dựng giao diện người dùng hiện đại với React",
    level: "Trung Cấp",
    chapters: 12,
    duration: "6 tuần",
    category: "Phát Triển Web",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #4FD1C5 0%, #38B2AC 100%)"
  },
  {
    id: "node-basics",
    title: "Node.js Cơ Bản",
    description: "Tạo ứng dụng phía máy chủ với Node.js",
    level: "Trung Cấp",
    chapters: 10,
    duration: "5 tuần",
    category: "Phát Triển Backend",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #68D391 0%, #48BB78 100%)"
  }
];

// Component trang khóa học
const Courses = () => {
  // State quản lý tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [filteredCourses, setFilteredCourses] = useState(coursesData);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Effect áp dụng bộ lọc khi các điều kiện thay đổi
  useEffect(() => {
    const filtered = coursesData.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === '' || course.category === categoryFilter;
      const matchesLevel = levelFilter === '' || course.level === levelFilter;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
    
    setFilteredCourses(filtered);
  }, [searchTerm, categoryFilter, levelFilter]);
  
  // Lấy danh sách các danh mục và cấp độ độc nhất
  const categories = [...new Set(coursesData.map(course => course.category))];
  const levels = [...new Set(coursesData.map(course => course.level))];
  
  // Xử lý xóa bộ lọc
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLevelFilter('');
  };
  
  // Chuyển đổi hiển thị bộ lọc trên điện thoại
  const toggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="bg-epu-dark text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">Khám Phá Các Khóa Học</h1>
            <p className="text-gray-300 max-w-3xl">
              Khám phá nhiều khóa học lập trình được thiết kế để đưa bạn từ người mới đến chuyên gia. Mỗi khóa học bao gồm các bài học tương tác và bài kiểm tra sau mỗi chương.
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-10">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="md:hidden">
                <Button variant="outline" onClick={toggleFilters} className="w-full flex items-center justify-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ Lọc
                </Button>
              </div>
              
              <div className={`md:flex gap-4 ${isFilterVisible ? 'flex flex-col' : 'hidden'}`}>
                <div className="w-full md:w-48">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Danh Mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất Cả Danh Mục</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-48">
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cấp Độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất Cả Cấp Độ</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(categoryFilter || levelFilter || searchTerm) && (
                  <Button variant="outline" onClick={handleClearFilters} className="flex items-center justify-center">
                    <X className="h-4 w-4 mr-2" />
                    Xóa Bộ Lọc
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-500">Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
