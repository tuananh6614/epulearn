
import React from 'react';
import AnimatedCounter from './AnimatedCounter';
import { Users, BookOpen, Award, Clock } from 'lucide-react';

// Component hiển thị thống kê
const StatsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-50 rounded-lg p-6 text-center flex flex-col items-center group hover:shadow-md transition-all hover-scale shadow-pulse">
            <div className="w-16 h-16 rounded-full bg-epu-green/10 flex items-center justify-center mb-4 group-hover:bg-epu-green/20 transition-colors">
              <Users className="h-8 w-8 text-epu-green" />
            </div>
            <AnimatedCounter end={15000} suffix="+" />
            <p className="text-gray-600 mt-2">Học Viên Đang Học</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center flex flex-col items-center group hover:shadow-md transition-all hover-scale shadow-pulse">
            <div className="w-16 h-16 rounded-full bg-epu-blue/10 flex items-center justify-center mb-4 group-hover:bg-epu-blue/20 transition-colors">
              <BookOpen className="h-8 w-8 text-epu-blue" />
            </div>
            <AnimatedCounter end={50} suffix="+" />
            <p className="text-gray-600 mt-2">Khóa Học Lập Trình</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center flex flex-col items-center group hover:shadow-md transition-all hover-scale shadow-pulse">
            <div className="w-16 h-16 rounded-full bg-epu-green/10 flex items-center justify-center mb-4 group-hover:bg-epu-green/20 transition-colors">
              <Clock className="h-8 w-8 text-epu-green" />
            </div>
            <AnimatedCounter end={500} suffix="+" />
            <p className="text-gray-600 mt-2">Giờ Nội Dung</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center flex flex-col items-center group hover:shadow-md transition-all hover-scale shadow-pulse">
            <div className="w-16 h-16 rounded-full bg-epu-blue/10 flex items-center justify-center mb-4 group-hover:bg-epu-blue/20 transition-colors">
              <Award className="h-8 w-8 text-epu-blue" />
            </div>
            <AnimatedCounter end={8000} suffix="+" />
            <p className="text-gray-600 mt-2">Chứng Chỉ Đã Cấp</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
