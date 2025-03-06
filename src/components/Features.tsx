
import React from 'react';
import { Code, CheckCircle, BookOpen, Award } from "lucide-react";

// Component hiển thị các tính năng
const Features = () => {
  // Dữ liệu các tính năng
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-epu-green" />,
      title: "Bài Học Tương Tác",
      description: "Học các khái niệm lập trình thông qua các bài học tương tác hấp dẫn với các ví dụ code thực tế."
    },
    {
      icon: <Code className="h-8 w-8 text-epu-blue" />,
      title: "Thực Hành Trực Tiếp",
      description: "Áp dụng những gì bạn đã học với các bài tập coding có hướng dẫn và dự án thực tế."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-epu-green" />,
      title: "Kiểm Tra Sau Mỗi Chương",
      description: "Kiểm tra kiến thức sau mỗi chương với các bài kiểm tra toàn diện để củng cố việc học."
    },
    {
      icon: <Award className="h-8 w-8 text-epu-blue" />,
      title: "Nhận Chứng Chỉ",
      description: "Nhận chứng chỉ khi hoàn thành để thể hiện kỹ năng lập trình của bạn."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-epu-dark mb-4">EPU Learn Hoạt Động Như Thế Nào</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Nền tảng của chúng tôi giúp việc học code trở nên hấp dẫn, hiệu quả và thú vị với phương pháp đã được chứng minh.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center group hover-scale">
              <div className="mb-6 p-4 bg-gray-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-epu-dark">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
