import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from '@/hooks/useUser';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const { toast } = useToast();
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;

      if (currentScrollY > lastScrollY && scrollDirection !== 'down') {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY && scrollDirection !== 'up') {
        setScrollDirection('up');
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollDirection]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi tài khoản của mình.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Đăng xuất thất bại",
        description: "Đã có lỗi xảy ra trong quá trình đăng xuất.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className={`navbar ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'} transition-transform duration-300 ease-in-out bg-background/80 backdrop-blur-md border-b`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/placeholder.svg" alt="Logo" className="h-8 w-8 rounded-full" />
          <span className="font-bold text-lg">EPU Learn</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
            Trang chủ
          </Link>
          <Link to="/courses" className={`text-sm font-medium transition-colors hover:text-primary ${pathname.includes('/courses') ? 'text-primary' : 'text-muted-foreground'}`}>
            Khóa học
          </Link>
          <Link to="/use-case-diagram" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/use-case-diagram' ? 'text-primary' : 'text-muted-foreground'}`}>
            Use Case
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>Hồ sơ</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Đăng nhập
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Đăng ký
              </Link>
            </>
          )}
        </div>
        
        <div className="md:hidden">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
