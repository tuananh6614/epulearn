
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  User, 
  Database, 
  Server, 
  Computer, 
  Network,
  ArrowRight,
  Activity
} from 'lucide-react';

const UseCaseDiagram = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Biểu Đồ Use Case - EPU Learn</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Giới thiệu về Use Case Diagram</h2>
        <p className="text-gray-700 mb-4">
          Biểu đồ Use Case là một phần của UML (Unified Modeling Language), được sử dụng để mô tả các chức năng của hệ thống từ góc nhìn của người dùng. 
          Biểu đồ này giúp xác định, làm rõ và tổ chức các yêu cầu hệ thống.
        </p>
        <p className="text-gray-700">
          Các thành phần chính của biểu đồ Use Case bao gồm:
        </p>
        <ul className="list-disc list-inside ml-4 mt-2 text-gray-700">
          <li><strong>Actors (Tác nhân)</strong>: Người hoặc hệ thống bên ngoài tương tác với hệ thống của chúng ta</li>
          <li><strong>Use Cases (Trường hợp sử dụng)</strong>: Các chức năng hoặc dịch vụ mà hệ thống cung cấp cho người dùng</li>
          <li><strong>Relationships (Mối quan hệ)</strong>: Kết nối giữa các actors và use cases hoặc giữa các use cases với nhau</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Biểu đồ Use Case cho EPU Learn</h2>
        
        <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-8 overflow-auto" style={{ minHeight: '600px' }}>
          {/* Actors */}
          <div className="absolute left-10 top-40">
            <div className="flex flex-col items-center mb-16">
              <User size={40} className="border-2 border-blue-500 rounded-full p-2 bg-white" />
              <div className="mt-2 text-center font-medium">Học viên</div>
            </div>
            
            <div className="flex flex-col items-center mb-16">
              <Users size={40} className="border-2 border-green-500 rounded-full p-2 bg-white" />
              <div className="mt-2 text-center font-medium">Giảng viên</div>
            </div>
            
            <div className="flex flex-col items-center">
              <User size={40} className="border-2 border-red-500 rounded-full p-2 bg-white" />
              <div className="mt-2 text-center font-medium">Quản trị viên</div>
            </div>
          </div>
          
          {/* System boundary */}
          <div className="ml-40 mr-10 border-2 border-gray-300 rounded-lg p-4 bg-blue-50" style={{ minHeight: '500px' }}>
            <div className="text-center font-bold mb-6 text-blue-700">Hệ thống EPU Learn</div>
            
            {/* Use Cases */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-full py-3 px-6 border border-blue-300 text-center flex items-center justify-center">
                <span>Đăng ký tài khoản</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-blue-300 text-center flex items-center justify-center">
                <span>Đăng nhập hệ thống</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-blue-300 text-center flex items-center justify-center">
                <span>Xem danh sách khóa học</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-blue-300 text-center flex items-center justify-center">
                <span>Đăng ký khóa học</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-blue-300 text-center flex items-center justify-center">
                <span>Học bài học tương tác</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-blue-300 text-center flex items-center justify-center">
                <span>Làm bài kiểm tra</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-blue-300 text-center flex items-center justify-center">
                <span>Xem tiến độ học tập</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-blue-300 text-center flex items-center justify-center">
                <span>Nhận chứng chỉ</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-green-300 text-center flex items-center justify-center">
                <span>Tạo khóa học</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-green-300 text-center flex items-center justify-center">
                <span>Quản lý bài học</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-red-300 text-center flex items-center justify-center">
                <span>Quản lý người dùng</span>
              </div>
              
              <div className="bg-white rounded-full py-3 px-6 border border-red-300 text-center flex items-center justify-center">
                <span>Xem thống kê hệ thống</span>
              </div>
            </div>
          </div>
          
          {/* External Systems */}
          <div className="absolute right-10 top-40">
            <div className="flex flex-col items-center mb-16">
              <Database size={40} className="border-2 border-purple-500 rounded-full p-2 bg-white" />
              <div className="mt-2 text-center font-medium">Cơ sở dữ liệu</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Server size={40} className="border-2 border-orange-500 rounded-full p-2 bg-white" />
              <div className="mt-2 text-center font-medium">Máy chủ</div>
            </div>
          </div>
          
          {/* Arrows - simplified for clarity */}
          <div className="absolute left-[140px] top-44">
            <ArrowRight size={20} className="text-blue-500" />
          </div>
          <div className="absolute left-[140px] top-[280px]">
            <ArrowRight size={20} className="text-green-500" />
          </div>
          <div className="absolute left-[140px] top-[400px]">
            <ArrowRight size={20} className="text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Giải thích Biểu Đồ</h2>
        <p className="text-gray-700 mb-4">
          Biểu đồ use case trên minh họa các chức năng chính của hệ thống EPU Learn và cách các đối tượng (actors) tương tác với nó:
        </p>
        
        <h3 className="font-semibold text-lg mt-4 mb-2 text-blue-600">1. Actors (Tác nhân)</h3>
        <ul className="list-disc list-inside ml-4 text-gray-700 mb-4">
          <li><strong>Học viên</strong>: Người dùng chính của hệ thống, tham gia học các khóa học</li>
          <li><strong>Giảng viên</strong>: Tạo và quản lý nội dung khóa học, bài giảng</li>
          <li><strong>Quản trị viên</strong>: Quản lý hệ thống, người dùng và dữ liệu</li>
        </ul>
        
        <h3 className="font-semibold text-lg mt-4 mb-2 text-blue-600">2. Use Cases (Trường hợp sử dụng)</h3>
        <ul className="list-disc list-inside ml-4 text-gray-700 mb-4">
          <li><strong>Chức năng cho Học viên</strong>: Đăng ký, đăng nhập, xem khóa học, học bài, làm bài kiểm tra, nhận chứng chỉ</li>
          <li><strong>Chức năng cho Giảng viên</strong>: Tạo khóa học, quản lý bài học, xem thống kê học viên</li>
          <li><strong>Chức năng cho Quản trị viên</strong>: Quản lý người dùng, xem thống kê hệ thống</li>
        </ul>
        
        <h3 className="font-semibold text-lg mt-4 mb-2 text-blue-600">3. Hệ thống bên ngoài</h3>
        <ul className="list-disc list-inside ml-4 text-gray-700">
          <li><strong>Cơ sở dữ liệu</strong>: Lưu trữ thông tin người dùng, khóa học, tiến độ học tập</li>
          <li><strong>Máy chủ</strong>: Xử lý các yêu cầu, cung cấp các dịch vụ hệ thống</li>
        </ul>
        
        <div className="mt-8 flex justify-center">
          <Link to="/courses" className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition duration-300">
            Quay lại Khóa học
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UseCaseDiagram;
