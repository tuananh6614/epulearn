
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, BookOpen, GraduationCap, Home, Menu, X } from "lucide-react";
import ThemeToggle from './ThemeToggle';

// Component thanh điều hướng chính - đã cố định khi cuộn trang
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-gray-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/80 dark:border-gray-800 shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-green-500 to-blue-500 hover:shadow-glow transition-all duration-300">
              <Code className="h-4 w-4 text-white" />
            </div>
            <span className="text-white dark:text-white">EPU<span className="text-green-500">Learn</span></span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="nav-link text-sm font-medium flex items-center gap-1 text-white hover:text-green-400 transition-colors">
            <Home className="h-4 w-4" />
            Trang Chủ
          </Link>
          <Link to="/courses" className="nav-link text-sm font-medium flex items-center gap-1 text-white hover:text-green-400 transition-colors">
            <BookOpen className="h-4 w-4" />
            Khóa Học
          </Link>
          <Link to="/certification" className="nav-link text-sm font-medium flex items-center gap-1 text-white hover:text-green-400 transition-colors">
            <GraduationCap className="h-4 w-4" />
            Chứng Chỉ
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="hidden md:inline-flex text-white border-gray-700 hover:bg-gray-800 hover:text-green-400 transition-all" asChild>
            <Link to="/login">Đăng Nhập</Link>
          </Button>
          <Button size="sm" className="hidden md:inline-flex bg-green-600 hover:bg-green-500 text-white hover:scale-105 transition-transform" asChild>
            <Link to="/signup">Đăng Ký</Link>
          </Button>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-gray-800" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''} md:hidden`}>
        <nav className="flex flex-col items-center gap-8 py-8">
          <Link to="/" className="text-lg font-medium flex items-center gap-2 text-white" onClick={() => setMobileMenuOpen(false)}>
            <Home className="h-5 w-5" />
            Trang Chủ
          </Link>
          <Link to="/courses" className="text-lg font-medium flex items-center gap-2 text-white" onClick={() => setMobileMenuOpen(false)}>
            <BookOpen className="h-5 w-5" />
            Khóa Học
          </Link>
          <Link to="/certification" className="text-lg font-medium flex items-center gap-2 text-white" onClick={() => setMobileMenuOpen(false)}>
            <GraduationCap className="h-5 w-5" />
            Chứng Chỉ
          </Link>
          
          <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
            <Button variant="outline" className="w-full text-white border-gray-700 hover:bg-gray-800" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/login">Đăng Nhập</Link>
            </Button>
            <Button className="w-full bg-green-600 hover:bg-green-500 text-white" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/signup">Đăng Ký</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
