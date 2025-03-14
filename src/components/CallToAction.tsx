
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 font-montserrat tracking-tight">
          Bắt đầu học tập ngay hôm nay
        </h2>
        
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto font-inter leading-relaxed">
          Khám phá các khóa học chất lượng cao, được thiết kế bởi các chuyên gia hàng đầu
          trong lĩnh vực công nghệ.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">Khóa học React</h3>
            <p className="text-blue-100 mb-4 font-inter">Xây dựng giao diện người dùng hiện đại</p>
            <Link to="/courses?category=React">
              <button className="text-blue-700 bg-white rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors">
                Xem chi tiết
              </button>
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">JavaScript cơ bản</h3>
            <p className="text-blue-100 mb-4 font-inter">Nền tảng vững chắc cho lập trình web</p>
            <Link to="/courses?category=JavaScript">
              <button className="text-blue-700 bg-white rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors">
                Xem chi tiết
              </button>
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">Node.js Backend</h3>
            <p className="text-blue-100 mb-4 font-inter">Phát triển API và dịch vụ server</p>
            <Link to="/courses?category=Backend">
              <button className="text-blue-700 bg-white rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors">
                Xem chi tiết
              </button>
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">MongoDB & SQL</h3>
            <p className="text-blue-100 mb-4 font-inter">Quản lý dữ liệu hiệu quả</p>
            <Link to="/courses?category=Database">
              <button className="text-blue-700 bg-white rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors">
                Xem chi tiết
              </button>
            </Link>
          </div>
        </div>
        
        <div className="mt-10">
          <Link to="/courses">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-lg px-8 py-6 h-auto">
              Xem tất cả khóa học
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
