
import React from 'react';
import AnimatedCounter from './AnimatedCounter';
import { Users, BookOpen, Award, Clock } from 'lucide-react';

// Component hiển thị thống kê
const StatsSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center flex flex-col items-center group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-colors">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <AnimatedCounter end={15000} suffix="+" className="text-3xl font-bold text-gray-900 dark:text-white" />
            <p className="text-gray-700 dark:text-gray-300 mt-2">Học Viên Đang Học</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center flex flex-col items-center group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <AnimatedCounter end={50} suffix="+" className="text-3xl font-bold text-gray-900 dark:text-white" />
            <p className="text-gray-700 dark:text-gray-300 mt-2">Khóa Học Lập Trình</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center flex flex-col items-center group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-colors">
              <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <AnimatedCounter end={500} suffix="+" className="text-3xl font-bold text-gray-900 dark:text-white" />
            <p className="text-gray-700 dark:text-gray-300 mt-2">Giờ Nội Dung</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center flex flex-col items-center group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
              <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <AnimatedCounter end={8000} suffix="+" className="text-3xl font-bold text-gray-900 dark:text-white" />
            <p className="text-gray-700 dark:text-gray-300 mt-2">Chứng Chỉ Đã Cấp</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
