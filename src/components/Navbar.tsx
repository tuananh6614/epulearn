
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, BookOpen, GraduationCap, Home, Menu, X } from "lucide-react";

// Component thanh điều hướng chính với hiệu ứng khi hover
const Navbar = () => {
  // State quản lý menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State quản lý hiệu ứng scroll
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect theo dõi sự kiện scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Đăng ký lắng nghe sự kiện scroll
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800/50' 
        : 'bg-transparent border-b border-gray-800/30'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-r from-epu-green to-epu-blue group-hover:shadow-md group-hover:shadow-epu-green/30 transition-all duration-300 transform group-hover:scale-110">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="text-white group-hover:text-epu-green transition-colors duration-300">EPU<span className="text-epu-green">Learn</span></span>
          </Link>
        </div>
        
        {/* Menu trên desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium flex items-center gap-1 text-gray-300 transition-all duration-300 hover:text-white relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-epu-green after:transition-all after:duration-300">
            <Home className="h-4 w-4" />
            Trang Chủ
          </Link>
          <Link to="/courses" className="text-sm font-medium flex items-center gap-1 text-gray-300 transition-all duration-300 hover:text-white relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-epu-green after:transition-all after:duration-300">
            <BookOpen className="h-4 w-4" />
            Khóa Học
          </Link>
          <Link to="/certification" className="text-sm font-medium flex items-center gap-1 text-gray-300 transition-all duration-300 hover:text-white relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-epu-green after:transition-all after:duration-300">
            <GraduationCap className="h-4 w-4" />
            Chứng Chỉ
          </Link>
        </nav>
        
        {/* Nút đăng nhập/đăng ký với hiệu ứng hover */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-white hover:text-epu-green hover:bg-white/10 transition-all duration-300" asChild>
            <Link to="/login">Đăng Nhập</Link>
          </Button>
          <Button size="sm" className="bg-epu-green hover:bg-epu-green/90 text-white shadow-md hover:shadow-lg hover:shadow-epu-green/20 transform hover:translate-y-[-2px] transition-all duration-300" asChild>
            <Link to="/signup">Đăng Ký</Link>
          </Button>
        </div>
        
        {/* Menu cho mobile */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Menu dropdown cho mobile */}
      {isMenuOpen && (
        <div className="md:hidden absolute inset-x-0 top-16 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 animate-fade-in">
          <div className="container py-4 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800/50 transition-colors">
              <Home className="h-5 w-5" />
              Trang Chủ
            </Link>
            <Link to="/courses" className="flex items-center gap-2 text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800/50 transition-colors">
              <BookOpen className="h-5 w-5" />
              Khóa Học
            </Link>
            <Link to="/certification" className="flex items-center gap-2 text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800/50 transition-colors">
              <GraduationCap className="h-5 w-5" />
              Chứng Chỉ
            </Link>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
              <Button variant="ghost" className="text-white hover:text-epu-green hover:bg-white/10" asChild>
                <Link to="/login">Đăng Nhập</Link>
              </Button>
              <Button className="bg-epu-green hover:bg-epu-green/90 text-white" asChild>
                <Link to="/signup">Đăng Ký</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
