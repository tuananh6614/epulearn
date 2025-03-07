
import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';
import CodeAnimation from './CodeAnimation';
import ParallaxEffect from './ParallaxEffect';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect for mouse movement
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const layers = container.querySelectorAll('.parallax-mouse-layer');
      
      const x = e.clientX;
      const y = e.clientY;
      
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        layers.forEach((layer: Element) => {
          const htmlLayer = layer as HTMLElement;
          const speed = parseFloat(htmlLayer.getAttribute('data-speed') || '0');
          
          const xOffset = (window.innerWidth / 2 - x) * speed / 50;
          const yOffset = (window.innerHeight / 2 - y) * speed / 50;
          
          htmlLayer.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        });
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-b from-background to-gray-50 dark:from-gray-900 dark:to-gray-950 py-12 md:py-24 transform-3d"
    >
      {/* Background elements with parallax effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <ParallaxEffect speed={-0.2}>
          <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-primary/5 dark:bg-primary/10 transform-gpu" />
        </ParallaxEffect>
        <ParallaxEffect speed={-0.3}>
          <div className="absolute bottom-1/4 right-1/6 w-96 h-96 rounded-full bg-epu-blue/5 dark:bg-epu-blue/10 transform-gpu animation-delay-500" />
        </ParallaxEffect>
        <ParallaxEffect speed={-0.1}>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-epu-green/10 dark:bg-epu-green/15 transform-gpu animation-delay-1000" />
        </ParallaxEffect>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="parallax-mouse-layer" data-speed="1.5">
              <div className="typewriter mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-epu-dark dark:text-white leading-tight mb-4 inline-block">
                  Học lập trình <span className="text-epu-green">tương tác</span>
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Làm chủ các ngôn ngữ lập trình thông qua các bài học tương tác và kiểm tra kiến thức sau mỗi chương. Biến việc học thành một cuộc phiêu lưu!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 parallax-mouse-layer" data-speed="1">
              <Button className="interactive-button bg-epu-green hover:bg-epu-green/90 text-white px-6 py-6 rounded-md text-lg" asChild>
                <Link to="/courses">
                  Khám Phá Khóa Học
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" className="interactive-button border-epu-blue text-epu-blue dark:text-epu-blue hover:bg-epu-blue/10 px-6 py-6 rounded-md text-lg" asChild>
                <Link to="/demo">Thử Bài Học Demo</Link>
              </Button>
            </div>
          </div>
          
          <ParallaxEffect speed={0.2}>
            <div className="parallax-mouse-layer" data-speed="-1">
              <div className="relative hover-card bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 dark:bg-gray-900 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="pt-8 px-6 pb-6 bg-gray-900 dark:bg-gray-950 text-white font-mono">
                  <CodeAnimation />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-epu-green/20 rounded-full blur-xl animate-pulse-light"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-epu-blue/20 rounded-full blur-xl animate-pulse-light animation-delay-1000"></div>
            </div>
          </ParallaxEffect>
        </div>
      </div>
    </div>
  );
};

export default Hero;
