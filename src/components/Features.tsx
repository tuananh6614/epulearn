
import React from 'react';
import { Code, CheckCircle, BookOpen, Award } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

// Component hiển thị các tính năng với độ tương phản cao hơn
const Features = () => {
  const isMobile = useIsMobile();
  
  // Dữ liệu các tính năng
  const features = [
    {
      icon: <BookOpen className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-green-500`} />,
      title: "Bài Học Tương Tác",
      description: "Học các khái niệm lập trình thông qua các bài học tương tác hấp dẫn với các ví dụ code thực tế."
    },
    {
      icon: <Code className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-blue-500`} />,
      title: "Thực Hành Trực Tiếp",
      description: "Áp dụng những gì bạn đã học với các bài tập coding có hướng dẫn và dự án thực tế."
    },
    {
      icon: <CheckCircle className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-green-500`} />,
      title: "Kiểm Tra Sau Mỗi Chương",
      description: "Kiểm tra kiến thức sau mỗi chương với các bài kiểm tra toàn diện để củng cố việc học."
    },
    {
      icon: <Award className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-blue-500`} />,
      title: "Nhận Chứng Chỉ",
      description: "Nhận chứng chỉ khi hoàn thành để thể hiện kỹ năng lập trình của bạn."
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 sm:w-40 h-20 sm:h-40 rounded-full bg-green-500/30 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-32 sm:w-60 h-32 sm:h-60 rounded-full bg-blue-500/30 blur-3xl"></div>
      </div>
      
      <div className="container-responsive mx-auto px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">EPU Learn Hoạt Động Như Thế Nào</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">Nền tảng của chúng tôi giúp việc học code trở nên hấp dẫn, hiệu quả và thú vị với phương pháp đã được chứng minh.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center group hover-scale bg-white/50 dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg dark:shadow-gray-800/10 transition-all card-content">
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
