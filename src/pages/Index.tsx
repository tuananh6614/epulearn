
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

// Component trang chủ chính
const Index = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Các phần tử code nổi để tạo hiệu ứng nền */}
      <FloatingCode style={{ top: '15%', right: '5%', transform: 'rotate(15deg)' }} />
      <FloatingCode style={{ bottom: '20%', left: '2%', transform: 'rotate(-10deg)' }} />
      <FloatingCode style={{ top: '40%', left: '10%', transform: 'rotate(5deg)' }} />
      
      <Navbar />
      <main>
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
