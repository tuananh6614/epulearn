
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Lovable-style dark gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600"></div>
      
      {/* Particle effect in background */}
      <div className="absolute inset-0 -z-5">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 blur-xl"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              transform: 'translate(-50%, -50%)',
              animation: `float ${Math.random() * 10 + 15}s ease-in-out infinite`
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white">
            Sẵn Sàng Bắt Đầu Hành Trình Học Code?
          </h2>
          <p className="text-lg md:text-xl mb-10 text-black/90 text-gray-800 dark:text-white">
            Tham gia cùng hàng nghìn học viên đã thay đổi sự nghiệp của họ thông qua các khóa học lập trình tương tác của chúng tôi.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:text-white/90 shadow-md hover:shadow-lg rounded-full transition-all duration-300 transform hover:scale-105 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900"
              asChild
            >
              <Link 
                to="/signup" 
                className="font-semibold flex items-center justify-center gap-2 px-8 py-6"
              >
                <span className="z-10 dark:text-white/95">Bắt Đầu Ngay Hôm Nay</span>
                <ArrowRight className="z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 dark:text-white/95" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:bg-white/20" />
              </Link>
            </Button>

            {/* Nút phụ */}
            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-gray-800 hover:border-blue-500 text-gray-800 hover:text-blue-600 bg-transparent hover:bg-blue-50/50 shadow-md hover:shadow-lg rounded-full transition-all duration-300 transform hover:scale-105 dark:border-gray-200 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-300 dark:hover:bg-white/5"
              asChild
            >
              <Link 
                to="/courses" 
                className="font-semibold flex items-center justify-center px-8 py-6"
              >
                <span className="z-10 dark:text-gray-100">Xem Các Khóa Học</span>
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full dark:bg-blue-400/10" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
