
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';
import CodeAnimation from './CodeAnimation';

// Component Hero chính hiển thị phần đầu trang
const Hero = () => {
  return (
    <div className="relative overflow-hidden py-12 md:py-24">
      {/* Các phần tử nền có animation */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-float absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-epu-green/10 blur-2xl"></div>
        <div className="animate-float animation-delay-1000 absolute bottom-1/4 right-1/6 w-96 h-96 rounded-full bg-orange-500/10 blur-2xl"></div>
        <div className="animate-pulse-light absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-epu-green/10 blur-xl"></div>
        
        {/* Thêm các phần tử ngôi sao nhấp nháy */}
        <div className="star-twinkle absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-white"></div>
        <div className="star-twinkle animation-delay-500 absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-white"></div>
        <div className="star-twinkle animation-delay-1000 absolute top-1/2 right-1/5 w-2 h-2 rounded-full bg-white"></div>
        <div className="star-twinkle animation-delay-1500 absolute bottom-1/5 left-1/4 w-2 h-2 rounded-full bg-white"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 inline-block glow-effect">
                Học lập trình <span className="text-epu-green">tương tác</span>
              </h1>
            </div>
            <p className="text-lg text-gray-300 mb-8 fade-in-out animation-delay-500">
              Làm chủ các ngôn ngữ lập trình thông qua các bài học tương tác và kiểm tra kiến thức sau mỗi chương. Biến việc học thành một cuộc phiêu lưu!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gradient-to-r from-epu-green to-green-400 hover:from-epu-green/90 hover:to-green-400/90 text-white px-6 py-6 rounded-md text-lg shadow-lg shadow-green-500/20 border-glow" asChild>
                <Link to="/courses">
                  Khám Phá Khóa Học
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-6 py-6 rounded-md text-lg breathe" asChild>
                <Link to="/demo">Thử Bài Học Demo</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative wave-animation">
            <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700 hover-scale">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="pt-8 px-6 pb-6 bg-gray-900/80 text-green-400 font-mono">
                <CodeAnimation />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-epu-green/20 rounded-full blur-xl animate-pulse-light"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-500/20 rounded-full blur-xl animate-pulse-light animation-delay-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
