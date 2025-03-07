
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Component kêu gọi hành động
const CallToAction = () => {
  return (
    <section className="py-20 relative overflow-hidden cta-section">
      {/* Nền gradient có animation */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-green-600 opacity-90"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6 text-white">Sẵn Sàng Bắt Đầu Hành Trình Học Code?</h2>
          <p className="text-xl mb-10 text-white opacity-90">
            Tham gia cùng hàng nghìn học viên đã thay đổi sự nghiệp của họ thông qua các khóa học lập trình tương tác của chúng tôi.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-white/90 shadow-lg" asChild>
              <Link to="/signup">
                Bắt Đầu Ngay Hôm Nay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 shadow-lg" asChild>
              <Link to="/courses">Xem Các Khóa Học</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
