import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Component trang khóa học
const Courses = () => {
  // State quản lý tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [coursesData, setCoursesData] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Server API URL from environment or use a relative path
  const API_URL = 'http://localhost:3000/api/courses';
  
  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching courses from API:', API_URL);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Không thể tải danh sách khóa học');
        }
        const data = await response.json();
        console.log('Fetched courses data:', data);
        setCoursesData(data);
        setFilteredCourses(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải khóa học:', err);
        setError(err.message);
        setIsLoading(false);
        
        toast({
          title: "Không thể kết nối đến máy chủ",
          description: "Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
          variant: "destructive",
        });
      }
    };

    fetchCourses();
  }, [toast]);
  
  // Effect áp dụng bộ lọc khi các điều kiện thay đổi
  useEffect(() => {
    if (coursesData.length === 0) return;
    
    const filtered = coursesData.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
    
    setFilteredCourses(filtered);
  }, [searchTerm, categoryFilter, levelFilter, coursesData]);
  
  // Lấy danh sách các danh mục và cấp độ độc nhất
  const categories = coursesData.length > 0 ? [...new Set(coursesData.map(course => course.category))] : [];
  const levels = coursesData.length > 0 ? [...new Set(coursesData.map(course => course.level))] : [];
  
  // Xử lý xóa bộ lọc
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setLevelFilter('all');
  };
  
  // Thử lại khi gặp lỗi
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    
    const fetchCourses = async () => {
      try {
        console.log('Retrying fetch courses from API:', API_URL);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Không thể tải danh sách khóa học');
        }
        const data = await response.json();
        setCoursesData(data);
        setFilteredCourses(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải khóa học:', err);
        setError(err.message);
        setIsLoading(false);
        
        toast({
          title: "Không thể kết nối đến máy chủ",
          description: "Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
          variant: "destructive",
        });
      }
    };

    fetchCourses();
  };
  
  // Chuyển đổi hiển thị bộ lọc trên điện thoại
  const toggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        <div className="bg-epu-dark text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">Khám Phá Các Khóa Học</h1>
            <p className="text-gray-300 max-w-3xl">
              Khám phá nhiều khóa học lập trình được thiết kế để đưa bạn từ người mới đến chuyên gia. Mỗi khóa học bao gồm các bài học tương tác và bài kiểm tra sau mỗi chương.
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-10">
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
                      <SelectItem value="all">Tất Cả Danh Mục</SelectItem>
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
                      <SelectItem value="all">Tất Cả Cấp Độ</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(categoryFilter !== 'all' || levelFilter !== 'all' || searchTerm) && (
                  <Button variant="outline" onClick={handleClearFilters} className="flex items-center justify-center">
                    <X className="h-4 w-4 mr-2" />
                    Xóa Bộ Lọc
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                <div key={index} className="bg-gray-200 dark:bg-gray-700 animate-pulse h-80 rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">Lỗi tải khóa học</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
              <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Button>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-500 dark:text-gray-400">Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;