
import React from 'react';
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

// Component trang chủ chính
const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden relative">
      {/* Hiệu ứng mưa số */}
      <NumberRain />
      
      {/* Các phần tử code nổi để tạo hiệu ứng nền */}
      <FloatingCode style={{ top: '15%', right: '5%', transform: 'rotate(15deg)' }} />
      <FloatingCode style={{ bottom: '20%', left: '2%', transform: 'rotate(-10deg)' }} />
      <FloatingCode style={{ top: '40%', left: '10%', transform: 'rotate(5deg)' }} />
      
      {/* Các đốm sáng trang trí */}
      <div className="absolute top-1/4 right-1/6 w-64 h-64 rounded-full bg-epu-green/5 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/6 w-96 h-96 rounded-full bg-epu-blue/5 blur-3xl"></div>
      <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl"></div>
      
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
