import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Code, BookOpen, Home, Menu, X, User, LogOut, Crown } from "lucide-react";
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);
  
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b safe-area-inset transition-all duration-300 ${
      scrolled ? "bg-white/90 dark:bg-gray-900/90 shadow-md backdrop-blur-md" : "bg-transparent dark:bg-gray-900/90"
    }`}>
      <div className="container-responsive mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-gradient-to-r from-green-500 to-blue-500 shadow-inner">
              <Code className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white font-bold tracking-wide text-sm sm:text-xl">EPU<span className="text-green-400">Learn</span></span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="nav-link text-sm font-medium flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-green-500 dark:hover:text-green-400 transition-colors whitespace-nowrap">
            <Home className="h-4 w-4" />
            Trang Chủ
          </Link>
          <Link to="/courses" className="nav-link text-sm font-medium flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-green-500 dark:hover:text-green-400 transition-colors whitespace-nowrap">
            <BookOpen className="h-4 w-4" />
            Khóa Học
          </Link>
          <Link to="/vip-courses" className="nav-link text-sm font-medium flex items-center gap-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300 transition-colors whitespace-nowrap">
            <Crown className="h-4 w-4" />
            Khóa Học VIP
          </Link>
        </nav>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full h-8 w-8 border-green-500 touch-target">
                  <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 shadow-md">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer touch-target" onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer touch-target" onClick={() => navigate('/my-courses')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Khóa học của tôi</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 dark:text-red-400 touch-target" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden md:inline-flex text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all touch-target" asChild>
                <Link to="/login">Đăng Nhập</Link>
              </Button>
              <Button size="sm" className="hidden md:inline-flex bg-green-500 hover:bg-green-600 text-white hover:scale-105 transition-transform touch-target" asChild>
                <Link to="/signup">Đăng Ký</Link>
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 touch-target" onClick={toggleMobileMenu} aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''} md:hidden`}>
        <nav className="flex flex-col items-center gap-6 py-8 mt-16">
          <Link to="/" className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white touch-target" onClick={() => setMobileMenuOpen(false)}>
            <Home className="h-5 w-5" />
            Trang Chủ
          </Link>
          
          <Link to="/courses" className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white touch-target" onClick={() => setMobileMenuOpen(false)}>
            <BookOpen className="h-5 w-5" />
            Khóa Học
          </Link>
          
          <Link to="/vip-courses" className="text-lg font-medium flex items-center gap-2 text-yellow-600 dark:text-yellow-400 touch-target" onClick={() => setMobileMenuOpen(false)}>
            <Crown className="h-5 w-5" />
            Khóa Học VIP
          </Link>
          
          <div className="flex flex-col gap-4 mt-4 w-full max-w-xs px-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 touch-target" onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/profile');
                }}>
                  Hồ sơ của tôi
                </Button>
                <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 touch-target" onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/my-courses');
                }}>
                  Khóa học của tôi
                </Button>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600 text-white touch-target" 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng Xuất
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 touch-target" onClick={() => setMobileMenuOpen(false)} asChild>
                  <Link to="/login">Đăng Nhập</Link>
                </Button>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white touch-target" onClick={() => setMobileMenuOpen(false)} asChild>
                  <Link to="/signup">Đăng Ký</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
