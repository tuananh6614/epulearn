
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Loader2, CheckCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from './UserAvatar';
import { useAuth } from '@/context/AuthContext';
import { EnrolledCourse } from '@/models/lesson';
import { fetchUserEnrolledCourses } from '@/services/apiUtils';
import { toast } from 'sonner';
import { User } from '@/types/auth';

interface UserSidebarProps {
  user?: User;
  enrolledCoursesCount?: number;
  certificatesCount?: number;
  isLoading?: boolean;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ 
  user: propUser,
  enrolledCoursesCount = 0,
  certificatesCount = 0,
  isLoading: propIsLoading 
}) => {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(propIsLoading !== undefined ? propIsLoading : true);
  
  // Use the prop user if provided, otherwise fall back to currentUser from context
  const userToDisplay = propUser || currentUser;
  
  useEffect(() => {
    // If we already have a count, we don't need to fetch courses for counting
    if (enrolledCoursesCount > 0) {
      return;
    }

    // Only fetch courses if we don't have a count and the user is logged in
    const loadEnrolledCourses = async () => {
      if (!userToDisplay) {
        setIsLoadingCourses(false);
        return;
      }
      
      try {
        setIsLoadingCourses(true);
        const courses = await fetchUserEnrolledCourses(userToDisplay.id);
        setEnrolledCourses(courses);
      } catch (error) {
        console.error('Error loading enrolled courses:', error);
        toast.error('Không thể tải khóa học đã đăng ký');
      } finally {
        setIsLoadingCourses(false);
      }
    };
    
    loadEnrolledCourses();
  }, [userToDisplay, enrolledCoursesCount]);
  
  if (!userToDisplay) {
    return null;
  }
  
  return (
    <div className="md:w-64 space-y-4">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <UserAvatar 
              avatarUrl={userToDisplay.avatarUrl || null} 
              firstName={userToDisplay.firstName} 
              lastName={userToDisplay.lastName}
              size="lg"
              editable={true}
            />
          </div>
          <h2 className="text-xl font-semibold">{userToDisplay.firstName} {userToDisplay.lastName}</h2>
          <p className="text-muted-foreground text-sm">{userToDisplay.email}</p>
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
          ) : enrolledCourses.length > 0 || enrolledCoursesCount > 0 ? (
            <>
              {enrolledCourses.length > 0 && enrolledCourses.map((course) => (
                <div key={course.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <Link to={`/course/${course.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {course.title}
                    </Link>
                    <div className="flex items-center">
                      {course.isCompleted && (
                        <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      )}
                      <span>{course.progress}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={course.progress} 
                    className={`h-2 ${course.isCompleted ? 'bg-green-100' : ''}`} 
                  />
                  {course.status === 'draft' && (
                    <p className="text-xs text-amber-500 mt-1">Bản nháp</p>
                  )}
                  {course.status === 'archived' && (
                    <p className="text-xs text-gray-500 mt-1">Đã lưu trữ</p>
                  )}
                </div>
              ))}
              {enrolledCourses.length === 0 && enrolledCoursesCount > 0 && (
                <div className="text-sm text-center text-muted-foreground py-2">
                  <p>Đã đăng ký {enrolledCoursesCount} khóa học</p>
                  <p className="mt-1">
                    <Link to="/my-courses" className="text-blue-600 hover:underline">Xem chi tiết</Link>
                  </p>
                </div>
              )}
            </>
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
