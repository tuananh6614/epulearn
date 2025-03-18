
import React from 'react';
import { Link } from "react-router-dom";
import { Code, Facebook, Twitter, Instagram, Linkedin, Mail, Github, Youtube, Heart } from "lucide-react";

// Component footer hiện đại hơn
const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">EPU<span className="text-green-500">Learn</span></span>
            </Link>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
              Nền tảng học tập hàng đầu cho sinh viên ngành CNTT, với các bài học tương tác và kiểm tra sau mỗi chương để củng cố kiến thức.
            </p>
            <div className="flex space-x-4">
              <a href="https://sinhvien.epu.edu.vn/Default.aspx" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover-scale hover:scale-110 transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors hover:scale-110 transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/panda_anh214/?hl=pt-brT%C3%A1" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors hover:scale-110 transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors hover:scale-110 transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/watch?v=abPmZCZZrFA" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors hover:scale-110 transition-all">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://github.com/Boybetanol/EPULearn" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors hover:scale-110 transition-all">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-5 text-gray-900 dark:text-white relative inline-block">
              Khóa Học
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-green-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Phát Triển Web
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Javascript nâng cao
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  JavaScript cơ bản
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Lập trình fullstack
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  React cơ bản
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-5 text-gray-900 dark:text-white relative inline-block">
              Tài Nguyên
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-green-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Hướng Dẫn
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Tài Liệu
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Cộng Đồng
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-5 text-gray-900 dark:text-white relative inline-block">
              Người sáng tạo
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-green-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://www.facebook.com/boycantien/" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Nguyễn Tuấn Anh
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/inhdung.936915" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Trần Đình Dũng
                </a>
              </li>
              <li>
                <Link to="" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                 ...
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  ..
                </Link>
              </li>
              <li>
                <Link to="" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                 ..
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 EPU Learn. Phát triển bởi nhóm 1 với 
              <Heart className="h-4 w-4 inline-block mx-1 text-red-500 animate-pulse" />
              từ EPU.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                <a href="mailto:tuananh6614@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors text-sm">tuananh6614@gmail.com</a>
              </div>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors text-sm">Chính sách bảo mật</a>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors text-sm">Điều khoản sử dụng</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
