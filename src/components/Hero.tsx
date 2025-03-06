
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Code, Play } from 'lucide-react';
import CodeAnimation from './CodeAnimation';

// Component Hero chính hiển thị phần đầu trang
const Hero = () => {
  // State theo dõi khi người dùng hover vào nút
  const [primaryBtnHover, setPrimaryBtnHover] = useState(false);
  const [secondaryBtnHover, setSecondaryBtnHover] = useState(false);

  return (
    <div className="relative overflow-hidden py-12 md:py-20">
      {/* Các phần tử nền có animation */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Lớp gradient nền */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800/90 to-gray-900/95"></div>
        
        {/* Vòng tròn ánh sáng nền */}
        <div className="animate-float absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-epu-green/10 blur-3xl"></div>
        <div className="animate-float animation-delay-1000 absolute bottom-1/4 right-1/6 w-96 h-96 rounded-full bg-epu-blue/10 blur-3xl"></div>
        <div className="animate-pulse-light absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-epu-green/5 blur-xl"></div>
        
        {/* Thêm các phần tử ngôi sao nhấp nháy */}
        <div className="star-twinkle absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-white/60"></div>
        <div className="star-twinkle animation-delay-500 absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-white/60"></div>
        <div className="star-twinkle animation-delay-1000 absolute top-1/2 right-1/5 w-2 h-2 rounded-full bg-white/60"></div>
        <div className="star-twinkle animation-delay-1500 absolute bottom-1/5 left-1/4 w-2 h-2 rounded-full bg-white/60"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-sm text-epu-green mb-4 animate-bounce-light">
              <Sparkles className="h-4 w-4" />
              <span>Học code theo cách mới</span>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 relative">
                <span className="relative inline-block">
                  Học lập trình <span className="bg-gradient-to-r from-epu-green to-green-400 bg-clip-text text-transparent">tương tác</span>
                  {/* Hiệu ứng viền sáng */}
                  <span className="absolute -inset-1 rounded-lg bg-epu-green/20 blur-xl opacity-70 animate-pulse-light"></span>
                </span>
              </h1>
              <p className="text-lg text-gray-300 md:pr-8">
                Làm chủ các ngôn ngữ lập trình thông qua các bài học tương tác và kiểm tra kiến thức sau mỗi chương. Biến việc học thành một cuộc phiêu lưu!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className={`group bg-gradient-to-r from-epu-green to-green-500 hover:from-epu-green/90 hover:to-green-500/90 
                text-white px-6 py-6 rounded-md text-lg relative overflow-hidden shadow-lg shadow-green-500/20 
                transform transition-all duration-300 ${primaryBtnHover ? 'translate-y-[-3px] shadow-xl' : ''}`}
                onMouseEnter={() => setPrimaryBtnHover(true)}
                onMouseLeave={() => setPrimaryBtnHover(false)}
                asChild
              >
                <Link to="/courses">
                  {/* Hiệu ứng dạng sóng */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                  <span className="relative flex items-center">
                    Khám Phá Khóa Học
                    <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${primaryBtnHover ? 'translate-x-1' : ''}`} />
                  </span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className={`group border-2 border-orange-500/80 text-orange-400 hover:bg-orange-500/10 px-6 py-6 
                rounded-md text-lg transition-all duration-300 ${secondaryBtnHover ? 'translate-y-[-3px] shadow-lg shadow-orange-500/20' : ''}`}
                onMouseEnter={() => setSecondaryBtnHover(true)}
                onMouseLeave={() => setSecondaryBtnHover(false)}
                asChild
              >
                <Link to="/demo" className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  <span>Thử Bài Học Demo</span>
                  
                  {/* Hiệu ứng điểm sáng khi hover */}
                  <span className={`absolute top-0 right-0 w-20 h-20 bg-orange-500/30 rounded-full blur-xl transition-opacity duration-300 ${secondaryBtnHover ? 'opacity-100' : 'opacity-0'}`}></span>
                </Link>
              </Button>
            </div>
            
            {/* Thêm thống kê nhỏ */}
            <div className="flex items-center gap-8 pt-2">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">5,000+</span>
                <span className="text-sm text-gray-400">Học viên</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">50+</span>
                <span className="text-sm text-gray-400">Khóa học</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">4.9</span>
                <span className="text-sm text-gray-400">Đánh giá</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Thêm hiệu ứng hover */}
            <div className="group relative bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700 hover:shadow-2xl hover:shadow-epu-green/20 transition-all duration-500 transform hover:scale-[1.02]">
              {/* Thanh tiêu đề giống MacOS */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  ~/epu-learn/examples/main.js
                </div>
              </div>
              
              {/* Hiện thị code với hiệu ứng */}
              <div className="pt-8 px-6 pb-6 bg-gray-900/80 text-green-400 font-mono">
                <CodeAnimation />
              </div>
              
              {/* Thanh status giả lập */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 text-xs text-gray-400 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <Code className="h-3.5 w-3.5" />
                  <span>JavaScript</span>
                </div>
                <div>UTF-8</div>
              </div>
            </div>
            
            {/* Hiệu ứng ánh sáng xung quanh */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-epu-green/20 rounded-full blur-xl animate-pulse-light"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-500/20 rounded-full blur-xl animate-pulse-light animation-delay-1000"></div>
            
            {/* Thêm các điểm sáng nhỏ xung quanh */}
            <div className="absolute top-1/4 -right-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
            <div className="absolute bottom-1/3 -left-3 w-2 h-2 bg-epu-green rounded-full animate-ping animation-delay-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
