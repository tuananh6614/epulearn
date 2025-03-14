
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Crown } from "lucide-react";

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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white dark:text-white">
            Sẵn Sàng Bắt Đầu Hành Trình Học Code?
          </h2>
          <p className="text-lg md:text-xl mb-10 text-white/90 dark:text-white/90">
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
              className="group border-2 border-white hover:border-blue-300 text-white hover:text-white bg-transparent hover:bg-white/10 shadow-md hover:shadow-lg rounded-full transition-all duration-300 transform hover:scale-105 dark:border-white dark:text-white dark:hover:border-blue-300 dark:hover:text-white dark:hover:bg-white/10"
              asChild
            >
              <Link 
                to="/courses" 
                className="font-semibold flex items-center justify-center px-8 py-6"
              >
                <span className="z-10">Xem Các Khóa Học</span>
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full dark:bg-blue-400/10" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* VIP subscription plans */}
      <div className="container mx-auto px-4 mt-24 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Đăng ký gói học VIP</h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto">
            Truy cập toàn bộ khóa học VIP và mở khóa các tính năng cao cấp với các gói đăng ký linh hoạt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Gói 1 tháng */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50 hover:translate-y-[-5px]">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Gói 1 Tháng</h3>
              </div>
              <div className="text-sm text-gray-300 mb-4">
                <span className="inline-block px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300 font-medium mb-2">Dùng thử</span>
                <p>Truy cập tất cả khóa học VIP trong 1 tháng</p>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">99.000đ</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Truy cập đầy đủ tất cả khóa học VIP</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Bài kiểm tra cơ bản</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Hỗ trợ email</span>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link to="/vip?tab=purchase">
                  Chọn gói này
                </Link>
              </Button>
            </div>
          </div>

          {/* Gói 3 tháng */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50 hover:translate-y-[-5px]">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Gói 3 Tháng</h3>
              </div>
              <div className="text-sm text-gray-300 mb-4">
                <p>Truy cập tất cả khóa học VIP trong 3 tháng</p>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">500.000đ</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Truy cập đầy đủ tất cả khóa học VIP</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Bài kiểm tra và đánh giá chuyên sâu</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Hỗ trợ trực tiếp từ giảng viên</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Chứng chỉ hoàn thành khóa học</span>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link to="/vip?tab=purchase">
                  Chọn gói này
                </Link>
              </Button>
            </div>
          </div>

          {/* Gói 6 tháng - Đề xuất */}
          <div className="bg-gradient-to-b from-amber-900/80 to-amber-950/80 backdrop-blur-sm border-2 border-yellow-500 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30 hover:translate-y-[-5px] relative">
            <div className="absolute top-0 right-0 bg-yellow-500 text-yellow-950 font-bold px-4 py-1 rounded-bl-lg text-sm">
              Phổ biến nhất
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Gói 6 Tháng</h3>
              </div>
              <div className="text-sm text-yellow-200/80 mb-4">
                <p>Truy cập tất cả khóa học VIP trong 6 tháng</p>
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-white">810.000đ</p>
                <p className="text-sm line-through text-yellow-200/70">900.000đ</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-yellow-400">Tiết kiệm 10%</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Truy cập đầy đủ tất cả khóa học VIP</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Bài kiểm tra và đánh giá chuyên sâu</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Hỗ trợ trực tiếp từ giảng viên</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Chứng chỉ hoàn thành khóa học</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Ưu tiên tiếp cận khóa học mới</span>
                </div>
              </div>
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-medium"
                asChild
              >
                <Link to="/vip?tab=purchase">
                  Chọn gói này
                </Link>
              </Button>
            </div>
          </div>

          {/* Gói 1 năm */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50 hover:translate-y-[-5px]">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Gói 1 Năm</h3>
              </div>
              <div className="text-sm text-gray-300 mb-4">
                <p>Truy cập tất cả khóa học VIP trong 12 tháng</p>
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold text-white">1.600.000đ</p>
                <p className="text-sm line-through text-gray-400">2.000.000đ</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-green-400">Tiết kiệm 20%</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Truy cập đầy đủ tất cả khóa học VIP</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Bài kiểm tra và đánh giá chuyên sâu</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Hỗ trợ trực tiếp từ giảng viên</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Chứng chỉ hoàn thành khóa học</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Ưu tiên tiếp cận khóa học mới</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Tài liệu bổ sung độc quyền</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Tư vấn học tập 1-1</span>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link to="/vip?tab=purchase">
                  Chọn gói này
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
