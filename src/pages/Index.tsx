
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedCourses from '@/components/FeaturedCourses';
import Features from '@/components/Features';
import StatsSection from '@/components/StatsSection';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import FloatingCode from '@/components/FloatingCode';
import NumberRain from '@/components/NumberRain';

// Component trang chủ chính với các hiệu ứng tương tác
const Index = () => {
  // State theo dõi trạng thái đã load
  const [isLoaded, setIsLoaded] = useState(false);
  // State theo dõi vị trí scroll
  const [scrollPosition, setScrollPosition] = useState(0);

  // Effect theo dõi sự kiện scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    // Đăng ký lắng nghe sự kiện scroll
    window.addEventListener('scroll', handleScroll);
    
    // Hiệu ứng load trang
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-900 via-gray-800/95 to-gray-900 text-white overflow-hidden relative transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hiệu ứng mưa số với tương tác chuột */}
      <NumberRain />
      
      {/* Lớp gradient để đảm bảo độ tương phản */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-gray-900/40 pointer-events-none"></div>
      
      {/* Các phần tử code nổi để tạo hiệu ứng nền với tương tác */}
      <FloatingCode style={{ top: '15%', right: '5%', transform: 'rotate(15deg)' }} />
      <FloatingCode style={{ bottom: '20%', left: '2%', transform: 'rotate(-10deg)' }} />
      <FloatingCode style={{ top: '40%', left: '10%', transform: 'rotate(5deg)' }} />
      <FloatingCode style={{ top: '60%', right: '15%', transform: 'rotate(-5deg)' }} variant="javascript" />
      <FloatingCode style={{ bottom: '40%', right: '25%', transform: 'rotate(8deg)' }} variant="python" />
      <FloatingCode style={{ top: '30%', left: '30%', transform: 'rotate(-8deg)' }} variant="html" />
      
      {/* Các đốm sáng trang trí với hiệu ứng */}
      <div className="absolute top-1/4 right-1/6 w-64 h-64 rounded-full bg-epu-green/5 blur-3xl animate-pulse-light"></div>
      <div className="absolute bottom-1/4 left-1/6 w-96 h-96 rounded-full bg-epu-blue/5 blur-3xl animate-pulse-light animation-delay-1000"></div>
      <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl animate-pulse-light animation-delay-500"></div>
      
      {/* Lưới nền mờ cho hiệu ứng cyber */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Các hạt sáng nhỏ */}
      <div className="particles-container absolute inset-0 pointer-events-none"></div>
      
      {/* Hiệu ứng tỏa sáng theo scroll */}
      <div 
        className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-epu-green/10 to-transparent blur-3xl opacity-30 transform transition-transform duration-1000"
        style={{
          transform: `translateY(${scrollPosition * 0.2}px) scale(${1 + scrollPosition * 0.001})`,
          opacity: Math.max(0, 0.3 - scrollPosition * 0.0005)
        }}
      ></div>
      
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <FeaturedCourses />
        <Features />
        <StatsSection />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
