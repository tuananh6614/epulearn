
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
              Nền tảng hàng đầu để học các ngôn ngữ lập trình thông qua bài học tương tác và kiểm tra sau mỗi chương.
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
              <li><Link to="/courses/web-development" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Phát Triển Web</Link></li>
              <li><Link to="/courses/python" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Python</Link></li>
              <li><Link to="/courses/javascript" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">JavaScript</Link></li>
              <li><Link to="/courses/java" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Java</Link></li>
              <li><Link to="/courses/c-plus-plus" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">C++</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Tài Nguyên</h3>
            <ul className="space-y-3">
              <li><Link to="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link to="/tutorials" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Hướng Dẫn</Link></li>
              <li><Link to="/documentation" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Tài Liệu</Link></li>
              <li><Link to="/faq" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">FAQ</Link></li>
              <li><Link to="/community" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Cộng Đồng</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Công Ty</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Về Chúng Tôi</Link></li>
              <li><Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Liên Hệ</Link></li>
              <li><Link to="/careers" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Tuyển Dụng</Link></li>
              <li><Link to="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Chính Sách Bảo Mật</Link></li>
              <li><Link to="/terms" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Điều Khoản Dịch Vụ</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">© 2023 EPU Learn. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center mt-4 md:mt-0">
            <Mail className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
            <a href="mailto:contact@epulearn.com" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">contact@epulearn.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
