import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, BookOpen, GraduationCap, Home, Menu, X } from "lucide-react";
import ThemeToggle from './ThemeToggle';

// Component thanh điều hướng chính
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className={`fixed top-0 z-50 w-full border-b ${scrolled ? 'shadow-md' : ''} bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 dark:bg-gray-900/95 dark:border-gray-800 transition-all duration-300`}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-epu-green to-epu-blue hover:shadow-glow transition-all duration-300">
              <Code className="h-4 w-4 text-white" />
            </div>
            <span className="text-foreground dark:text-white">EPU<span className="text-epu-green">Learn</span></span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="nav-link text-sm font-medium flex items-center gap-1 text-foreground transition-colors hover:text-primary dark:text-gray-100 dark:hover:text-white">
            <Home className="h-4 w-4" />
            Trang Chủ
          </Link>
          <Link to="/courses" className="nav-link text-sm font-medium flex items-center gap-1 text-foreground transition-colors hover:text-primary dark:text-gray-100 dark:hover:text-white">
            <BookOpen className="h-4 w-4" />
            Khóa Học
          </Link>
          <Link to="/certification" className="nav-link text-sm font-medium flex items-center gap-1 text-foreground transition-colors hover:text-primary dark:text-gray-100 dark:hover:text-white">
            <GraduationCap className="h-4 w-4" />
            Chứng Chỉ
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="hidden md:inline-flex hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 transition-transform" asChild>
            <Link to="/login">Đăng Nhập</Link>
          </Button>
          <Button size="sm" className="hidden md:inline-flex bg-epu-green hover:bg-epu-green/90 hover:scale-105 transition-transform" asChild>
            <Link to="/signup">Đăng Ký</Link>
          </Button>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''} md:hidden`}>
        <nav className="flex flex-col items-center gap-8 py-8">
          <Link to="/" className="text-lg font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Home className="h-5 w-5" />
            Trang Chủ
          </Link>
          <Link to="/courses" className="text-lg font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <BookOpen className="h-5 w-5" />
            Khóa Học
          </Link>
          <Link to="/certification" className="text-lg font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <GraduationCap className="h-5 w-5" />
            Chứng Chỉ
          </Link>
          
          <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
            <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/login">Đăng Nhập</Link>
            </Button>
            <Button className="w-full bg-epu-green hover:bg-epu-green/90" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/signup">Đăng Ký</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
