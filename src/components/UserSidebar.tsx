
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from './UserAvatar';
import { useAuth } from '@/context/AuthContext';
import { EnrolledCourse } from '@/models/lesson';
import { fetchUserEnrolledCourses } from '@/services/apiUtils';
import { toast } from 'sonner';

const UserSidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  
  useEffect(() => {
    const loadEnrolledCourses = async () => {
      if (!currentUser) {
        setIsLoadingCourses(false);
        return;
      }
      
      try {
        setIsLoadingCourses(true);
        const courses = await fetchUserEnrolledCourses(currentUser.id);
        setEnrolledCourses(courses);
      } catch (error) {
        console.error('Error loading enrolled courses:', error);
        toast.error('Không thể tải khóa học đã đăng ký');
      } finally {
        setIsLoadingCourses(false);
      }
    };
    
    loadEnrolledCourses();
  }, [currentUser]);
  
  return (
    <div className="md:w-64 space-y-4">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <UserAvatar 
              avatarUrl={currentUser?.avatarUrl || null} 
              firstName={currentUser?.firstName} 
              lastName={currentUser?.lastName}
              size="lg"
              editable={true}
            />
          </div>
          <h2 className="text-xl font-semibold">{currentUser?.firstName} {currentUser?.lastName}</h2>
          <p className="text-muted-foreground text-sm">{currentUser?.email}</p>
          <div className="mt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/my-courses">
                <BookOpen className="h-4 w-4 mr-2" />
                Khóa học của tôi
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Tiến độ học tập</h3>
          {isLoadingCourses ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
          ) : enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => (
              <div key={course.id} className="mb-3 last:mb-0">
                <div className="flex justify-between text-sm mb-1">
                  <Link to={`/course/${course.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {course.title}
                  </Link>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))
          ) : (
            <div className="text-sm text-center text-muted-foreground py-2">
              Bạn chưa đăng ký khóa học nào
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSidebar;
