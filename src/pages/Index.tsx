import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import { useIsMobile } from '@/hooks/use-mobile';

const FeaturedCourses = lazy(() => import('@/components/FeaturedCourses'));
const Features = lazy(() => import('@/components/Features'));
const StatsSection = lazy(() => import('@/components/StatsSection'));
const Testimonials = lazy(() => import('@/components/Testimonials'));
const CallToAction = lazy(() => import('@/components/CallToAction'));
const Footer = lazy(() => import('@/components/Footer'));
const FloatingCode = lazy(() => import('@/components/FloatingCode'));
const NumberRain = lazy(() => import('@/components/ui/NumberRain'));
const ParallaxEffect = lazy(() => import('@/components/ParallaxEffect'));

const SimpleSkeleton = () => (
  <div className="w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-40 my-4"></div>
);

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const fireflyContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  useEffect(() => {
    const loadContentWhenIdle = () => {
      setIsLoading(false);
    };
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadContentWhenIdle);
    } else {
      setTimeout(loadContentWhenIdle, 200);
    }
    
    return () => {
      if ('cancelIdleCallback' in window && (window as any)._idleCallbackId) {
        (window as any).cancelIdleCallback((window as any)._idleCallbackId);
      }
    };
  }, []);

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
    
    document.querySelectorAll('.lazy-fade-in').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      observer.disconnect();
    };
  }, [isLoading]);
  
  if (!hasMounted) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#0a0c12] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full max-w-6xl px-4">
          <div className="w-full h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse"></div>
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse"></div>
          <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#0a0c12] overflow-hidden relative">
      <Navbar />
      
      <main className="pt-20 sm:pt-28 safe-area-inset">
        <Hero />
        
        <Suspense fallback={<SimpleSkeleton />}>
          {!isMobile && (
            <>
              <NumberRain density={isMobile ? 20 : 40} interactive={!isMobile} />
              
              <div ref={fireflyContainerRef} className="firefly-container"></div>
              
              <FloatingCode 
                style={{ top: '15%', right: '5%', transform: 'rotate(15deg)' }} 
                language="javascript" 
                className="floating-code" 
              />
              
              <FloatingCode 
                style={{ bottom: '20%', left: '2%', transform: 'rotate(-10deg)' }} 
                language="python" 
                className="floating-code" 
              />
              
              <FloatingCode 
                style={{ top: '40%', left: '10%', transform: 'rotate(5deg)' }} 
                language="html" 
                className="floating-code" 
              />
            </>
          )}
          
          <div className="lazy-fade-in">
            <FeaturedCourses />
          </div>
          
          <div className="lazy-fade-in">
            <Features />
          </div>
          
          <div className="lazy-fade-in">
            <StatsSection />
          </div>
          
          <div className="lazy-fade-in">
            <Testimonials />
          </div>
          
          <div className="lazy-fade-in">
            <CallToAction />
          </div>
        </Suspense>
      </main>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-900"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
