
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, RefreshCw, Crown } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { fetchCourses } from '@/services/apiUtils';
import { Course, SupabaseCourseResponse } from '@/models/lesson';

// Component trang khóa học
const Courses = () => {
  // State quản lý tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch courses from database
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching courses from Supabase');
        
        const data = await fetchCourses();
        console.log('Fetched courses data:', data);
        
        // Transform data to match Course interface
        const formattedCourses: Course[] = data.map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          duration: course.duration,
          category: course.category,
          image: course.thumbnail_url || '/placeholder.svg',
          color: course.is_premium ? '#ffd700' : '#4f46e5', // Gold for premium, blue for regular
          isPremium: course.is_premium,
          price: course.price || undefined,
          discountPrice: course.discount_price || undefined,
          isFeatured: course.is_featured,
          instructor: course.instructor,
          chapters: [],  // Chapters will be loaded separately when viewing course details
        }));
        
        setCoursesData(formattedCourses);
        setFilteredCourses(formattedCourses);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải khóa học:', err);
        setError((err as Error).message);
        setIsLoading(false);
        
        toast({
          title: "Không thể kết nối đến máy chủ",
          description: "Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
          variant: "destructive",
        });
      }
    };

    loadCourses();
  }, [toast]);
  
  // Effect áp dụng bộ lọc khi các điều kiện thay đổi
  useEffect(() => {
    if (coursesData.length === 0) return;
    
    const filtered = coursesData.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
      const matchesPremium = premiumFilter === 'all' 
                          || (premiumFilter === 'premium' && course.isPremium) 
                          || (premiumFilter === 'free' && !course.isPremium);
      
      return matchesSearch && matchesCategory && matchesLevel && matchesPremium;
    });
    
    setFilteredCourses(filtered);
  }, [searchTerm, categoryFilter, levelFilter, premiumFilter, coursesData]);
  
  // Lấy danh sách các danh mục và cấp độ độc nhất
  const categories = coursesData.length > 0 ? [...new Set(coursesData.map(course => course.category))] : [];
  const levels = coursesData.length > 0 ? [...new Set(coursesData.map(course => course.level))] : [];
  
  // Xử lý xóa bộ lọc
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setLevelFilter('all');
    setPremiumFilter('all');
  };
  
  // Thử lại khi gặp lỗi
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    
    const loadCourses = async () => {
      try {
        console.log('Retrying fetch courses from Supabase');
        
        const data = await fetchCourses();
        
        // Transform data to match Course interface
        const formattedCourses: Course[] = data.map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          duration: course.duration,
          category: course.category,
          image: course.thumbnail_url || '/placeholder.svg',
          color: course.is_premium ? '#ffd700' : '#4f46e5', // Gold for premium, blue for regular
          isPremium: course.is_premium,
          price: course.price || undefined,
          discountPrice: course.discount_price || undefined,
          isFeatured: course.is_featured,
          instructor: course.instructor,
          chapters: [],  // Chapters will be loaded separately when viewing course details
        }));
        
        setCoursesData(formattedCourses);
        setFilteredCourses(formattedCourses);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải khóa học:', err);
        setError((err as Error).message);
        setIsLoading(false);
        
        toast({
          title: "Không thể kết nối đến máy chủ",
          description: "Vui lòng kiểm tra kết nối của bạn hoặc thử lại sau.",
          variant: "destructive",
        });
      }
    };

    loadCourses();
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
                
                <div className="w-full md:w-48">
                  <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Loại Khóa Học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất Cả Khóa Học</SelectItem>
                      <SelectItem value="free">Khóa Học Thường</SelectItem>
                      <SelectItem value="premium">
                        <div className="flex items-center gap-1">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          Khóa Học VIP
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(categoryFilter !== 'all' || levelFilter !== 'all' || premiumFilter !== 'all' || searchTerm) && (
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
                <CourseCard 
                  key={course.id} 
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  level={course.level}
                  duration={course.duration}
                  category={course.category}
                  image={course.image}
                  color={course.color}
                  isPremium={course.isPremium}
                  price={course.price}
                  discountPrice={course.discountPrice}
                />
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
