
import React from 'react';
import { Link } from "react-router-dom";
import { Code, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

// Component footer
const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-green-500 to-blue-500">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">EPU<span className="text-green-400">Learn</span></span>
            </Link>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Nền tảng hàng đầu để học các ngôn ngữ lập trình, các bài học liên quan đến các chuyên ngành thông qua bài học tương tác và kiểm tra sau mỗi chương.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover-scale">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover-scale">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover-scale">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover-scale">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Khóa Học</h3>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Phát Triển Web</Link></li>
              <li><Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Javascript nâng cao</Link></li>
              <li><Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">JavaScript cơ bản</Link></li>
              <li><Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">lập trình fullstack</Link></li>
              <li><Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">React cơ bản</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Tài Nguyên</h3>
            <ul className="space-y-3">
              <li><Link to="" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link to="" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Hướng Dẫn</Link></li>
              <li><Link to="" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Tài Liệu</Link></li>
              <li><Link to="" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">FAQ</Link></li>
              <li><Link to="" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Cộng Đồng</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Người sáng tạo</h3>
            <ul className="space-y-3">
              <li><a href="https://www.facebook.com/boycantien/" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              Nguyễn Tuấn Anh</a></li>
              <li><a href="https://www.facebook.com/inhdung.936915" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              Trần Đình Dũng</a></li>
              <li><Link to="" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">...</Link></li>
              <li><Link to="" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">...</Link></li>
              <li><Link to="" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">...</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">© 2025 EPU Learn. Phát triển bởi nhóm 1.</p>
          <div className="flex items-center mt-4 md:mt-0">
            <Mail className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
            <a href="mailto:contact@epulearn.com" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">tuananh6614@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
.