
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

// Dữ liệu đánh giá từ học viên
const testimonials = [
  {
    id: 1,
    content: "EPU Learn đã hoàn toàn thay đổi cách tôi tiếp cận code. Các bài tập tương tác đã làm cho quá trình học trở nên thú vị và hấp dẫn.",
    name: "Tuấn Anh",
    title: "Sinh viên Điện tử viễn thông",
    avatar: "/image/tuananh.svg"
  },
  {
    id: 2,
    content: "Là người không có kinh nghiệm lập trình trước đó, EPU Learn đã giúp tôi dễ dàng hiểu các khái niệm phức tạp thông qua các bài học từng bước.",
    name: "Đình Dũng",
    title: "Sinh viên Điện tử viễn thông",
    avatar: "/placeholder.svg"
  },
  {
    id: 3,
    content: "Các bài kiểm tra sau mỗi chương giúp củng cố những gì tôi đã học. Tôi cảm thấy tự tin về kỹ năng lập trình của mình sau khi hoàn thành các khóa học.",
    name: "Văn Phương",
    title: "Sinh viên Điện tử viễn thông",
    avatar: "/placeholder.svg"
  }
];

// Component hiển thị đánh giá từ học viên
const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Học Viên Nói Gì Về Chúng Tôi</h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">Tham gia cùng hàng nghìn học viên hài lòng đã nâng cao kỹ năng coding của họ với EPU Learn.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white dark:bg-gray-800 overflow-hidden hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-xl dark:shadow-blue-500/5 dark:hover:shadow-green-500/10">
              <CardContent className="p-6 relative">
                <Quote className="absolute top-6 right-6 h-10 w-10 text-gray-200 dark:text-gray-700 z-0" />
                <div className="relative z-10">
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">{testimonial.content}</p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
