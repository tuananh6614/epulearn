
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Sẵn Sàng Bắt Đầu Hành Trình Học Code?</h2>
          <p className="text-lg md:text-xl mb-10 text-white/90">
            Tham gia cùng hàng nghìn học viên đã thay đổi sự nghiệp của họ thông qua các khóa học lập trình tương tác của chúng tôi.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white hover:bg-white/90 text-blue-600 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all" 
              asChild
            >
              <Link to="/signup" className="font-medium">
                Bắt Đầu Ngay Hôm Nay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 shadow-lg hover:shadow-xl transition-all" 
              asChild
            >
              <Link to="/courses" className="font-medium">
                Xem Các Khóa Học
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
