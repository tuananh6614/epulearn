
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, BookOpen, GraduationCap, Home, Menu, X, User, LogOut } from "lucide-react";
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Component thanh điều hướng chính - đã cố định khi cuộn trang
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  
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
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled ? "bg-white/90 dark:bg-gray-900/90 shadow-md backdrop-blur-md" : "bg-transparent dark:bg-gray-900/90"
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-r from-green-500 to-blue-500 shadow-inner">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white font-bold tracking-wide">EPU<span className="text-green-400">Learn</span></span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="nav-link text-sm font-medium flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-green-500 dark:hover:text-green-400 transition-colors">
            <Home className="h-4 w-4" />
            Trang Chủ
          </Link>
          <Link to="/courses" className="nav-link text-sm font-medium flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-green-500 dark:hover:text-green-400 transition-colors">
            <BookOpen className="h-4 w-4" />
            Khóa Học
          </Link>
          <Link to="/certification" className="nav-link text-sm font-medium flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:text-green-500 dark:hover:text-green-400 transition-colors">
            <GraduationCap className="h-4 w-4" />
            Chứng Chỉ
          </Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full h-8 w-8 border-green-500">
                  <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Khóa học của tôi</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 dark:text-red-400" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden md:inline-flex text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" asChild>
                <Link to="/login">Đăng Nhập</Link>
              </Button>
              <Button size="sm" className="hidden md:inline-flex bg-green-500 hover:bg-green-600 text-white hover:scale-105 transition-transform" asChild>
                <Link to="/signup">Đăng Ký</Link>
              </Button>
            </>
          )}
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''} md:hidden`}>
        <nav className="flex flex-col items-center gap-8 py-8">
          <Link to="/" className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white" onClick={() => setMobileMenuOpen(false)}>
            <Home className="h-5 w-5" />
            Trang Chủ
          </Link>
          <Link to="/courses" className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white" onClick={() => setMobileMenuOpen(false)}>
            <BookOpen className="h-5 w-5" />
            Khóa Học
          </Link>
          <Link to="/certification" className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white" onClick={() => setMobileMenuOpen(false)}>
            <GraduationCap className="h-5 w-5" />
            Chứng Chỉ
          </Link>
          
          <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
            {isAuthenticated ? (
              <>
                <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" onClick={() => {
                  setMobileMenuOpen(false);
                  // Navigate to profile page in real app
                }}>
                  Hồ sơ của tôi
                </Button>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600 text-white" 
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
                <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/login">Đăng Nhập</Link>
                </Button>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white" asChild onClick={() => setMobileMenuOpen(false)}>
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
