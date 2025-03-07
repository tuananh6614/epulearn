
import React, { useEffect, useState, useRef } from 'react';
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
import ParallaxEffect from '@/components/ParallaxEffect';

// Component trang chủ chính
const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const fireflyContainerRef = useRef<HTMLDivElement>(null);

  // Update dark mode state when it changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Simulate content loading and optimization
  useEffect(() => {
    // Simulate resource loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Use intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lazy-loaded');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Select all elements with lazy-fade-in class
    document.querySelectorAll('.lazy-fade-in').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      observer.disconnect();
    };
  }, [isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a0c12] flex items-center justify-center">
        <div className="shimmer w-full max-w-6xl h-screen"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#0a0c12] overflow-hidden relative">
      {/* Digital rain effect */}
      <NumberRain density={40} interactive={true} />
      
      {/* Firefly container for dark mode */}
      <div ref={fireflyContainerRef} className="firefly-container"></div>
      
      {/* Floating code elements */}
      <ParallaxEffect speed={-0.2}>
        <FloatingCode style={{ top: '15%', right: '5%', transform: 'rotate(15deg)' }} language="javascript" />
      </ParallaxEffect>
      
      <ParallaxEffect speed={-0.4}>
        <FloatingCode style={{ bottom: '20%', left: '2%', transform: 'rotate(-10deg)' }} language="python" />
      </ParallaxEffect>
      
      <ParallaxEffect speed={-0.3}>
        <FloatingCode style={{ top: '40%', left: '10%', transform: 'rotate(5deg)' }} language="html" />
      </ParallaxEffect>
      
      <Navbar />
      
      <main className="pt-28"> {/* Tăng padding-top để tạo khoảng cách với navbar cố định */}
        <Hero />
        
        <div className="lazy-fade-in">
          <FeaturedCourses />
        </div>
        
        <div className="lazy-fade-in">
          <Features />
        </div>
        
        <div className="lazy-fade-in">
          <ParallaxEffect speed={0.1}>
            <StatsSection />
          </ParallaxEffect>
        </div>
        
        <div className="lazy-fade-in">
          <Testimonials />
        </div>
        
        <div className="lazy-fade-in">
          <CallToAction />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
