
import { UserIcon, BookOpen, Settings, LogOut, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { Link } from "react-router-dom";

interface UserSidebarProps {
  enrolledCoursesCount: number;
  isLoading?: boolean;
}

const UserSidebar = ({ enrolledCoursesCount, isLoading = false }: UserSidebarProps) => {
  const { currentUser, setShowLogoutConfirm } = useAuth();
  const userName = currentUser?.firstName 
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`
    : currentUser?.email?.split('@')[0] || 'Người dùng';
  
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };
  
  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="bg-white shadow-sm dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary/30">
              {currentUser?.avatarUrl ? (
                <AvatarImage src={currentUser.avatarUrl} alt={userName} />
              ) : (
                <AvatarFallback className="bg-primary-foreground text-primary text-xl uppercase">
                  {userName.substring(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <h2 className="text-xl font-bold text-center mb-1">{userName}</h2>
            <p className="text-muted-foreground text-sm">{currentUser?.email}</p>
            
            <div className="w-full border-t my-4 dark:border-gray-700"></div>
            
            <div className="grid grid-cols-1 gap-4 w-full text-center">
              <div>
                <p className="text-sm text-muted-foreground">Khóa học đã đăng ký</p>
                <p className="text-xl font-semibold mt-1">
                  {isLoading ? '-' : enrolledCoursesCount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <Card className="bg-white shadow-sm dark:bg-gray-800">
        <CardContent className="p-4">
          <nav className="space-y-1.5">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              asChild
            >
              <Link to="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Thông tin cá nhân
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              asChild
            >
              <Link to="/my-courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Khóa học của tôi
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              asChild
            >
              <Link to="/vip-courses">
                <CreditCard className="mr-2 h-4 w-4" />
                Gói VIP
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSidebar;
