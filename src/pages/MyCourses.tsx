// Fix the imports
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, GraduationCap, Loader2 } from 'lucide-react';
import { EnrolledCourse, Course } from '@/models/lesson';
import { api } from '@/integrations/api/client';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Mock enrolled courses data
    const mockEnrolledCourses: EnrolledCourse[] = [
      {
        id: '1',
        title: 'Introduction to React Development',
        description: 'Learn the fundamentals of React and build your first application.',
        image: '/placeholder.jpg',
        thumbnail_url: '/placeholder.jpg',
        level: 'Beginner',
        duration: '8 hours',
        category: 'Development',
        isPremium: false,
        is_premium: false,
        price: '',
        discountPrice: '',
        discount_price: '',
        progress: 50,
        lastAccessed: '2024-07-30T14:30:00Z',
        enrolledDate: '2024-07-15T09:00:00Z',
        color: '#4F46E5',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Advanced JavaScript Concepts',
        description: 'Dive deep into advanced JavaScript topics and become a master.',
        image: '/placeholder.jpg',
        thumbnail_url: '/placeholder.jpg',
        level: 'Advanced',
        duration: '12 hours',
        category: 'Development',
        isPremium: true,
        is_premium: true,
        price: '99.99',
        discountPrice: '79.99',
        discount_price: '79.99',
        progress: 80,
        lastAccessed: '2024-08-05T10:00:00Z',
        enrolledDate: '2024-07-20T15:00:00Z',
        color: '#10B981',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
    ];
    
    // Simulate fetching enrolled courses from an API
    setTimeout(() => {
      setEnrolledCourses(mockEnrolledCourses);
      setLoading(false);
    }, 500);
  }, [navigate, user]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Khóa học của tôi</h1>
        
        {enrolledCourses.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Chưa có khóa học nào</CardTitle>
              <CardDescription>
                Bạn chưa đăng ký bất kỳ khóa học nào.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Khám phá các khóa học có sẵn và bắt đầu học ngay hôm nay!
              </p>
              <Button asChild className="mt-4">
                <Link to="/courses">Xem các khóa học</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="bg-card text-card-foreground shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">Tiến độ:</span>
                    <span>{course.progress}%</span>
                  </div>
                </CardContent>
                <Button asChild className="w-full">
                  <Link to={`/course/${course.id}/start`} className="flex justify-center items-center">
                    Tiếp tục học
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default MyCourses;
