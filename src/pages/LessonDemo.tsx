import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Copy, Play, PlayCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

// ... keep existing code (htmlLessonData object) 

const LessonDemo = () => {
  // ... keep existing code (component state and handlers)
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Header */}
        <div className="bg-gray-100 dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Link to={`/course/${courseId}`} className="text-blue-500 hover:text-blue-700 flex items-center text-sm mb-1">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Quay lại {lessonData.course}
                </Link>
                <h1 className="text-2xl font-bold">{lessonData.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {lessonData.duration}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/course/${courseId}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Bài trước
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/course/${courseId}`}>
                    Bài tiếp
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* ... keep existing code (main content section) */}
        
        {/* Right side - Course navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
            <h3 className="font-bold mb-4">Nội dung khóa học</h3>
            
            <div className="space-y-4">
              <div className="chapter">
                <h4 className="font-medium text-sm mb-2">Chương 1: Giới Thiệu HTML</h4>
                <div className="space-y-1">
                  <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm flex items-center">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    <span>HTML là gì?</span>
                  </div>
                  <div className="p-2 rounded text-gray-500 text-sm flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Cấu trúc của một trang HTML</span>
                  </div>
                  <div className="p-2 rounded text-gray-500 text-sm flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Cài đặt môi trường phát triển</span>
                  </div>
                  <div className="p-2 rounded text-gray-500 text-sm flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Bài test chương 1</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="chapter">
                <h4 className="font-medium text-sm mb-2">Chương 2: Thẻ HTML Cơ Bản</h4>
                <div className="space-y-1">
                  <div className="p-2 rounded text-gray-500 text-sm flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Thẻ tiêu đề và đoạn văn</span>
                  </div>
                  <div className="p-2 rounded text-gray-500 text-sm flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Thẻ định dạng văn bản</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="w-full flex items-center justify-center" asChild>
                <Link to="/signup">
                  Đăng ký để mở khóa
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonDemo;