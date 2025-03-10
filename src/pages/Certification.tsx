
import React from 'react';
import { Link } from 'react-router-dom';
import { Award, FileText, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from "@/components/ui/use-toast";

// Sample certificate programs data
const certificatePrograms = [
  {
    id: "cert-1",
    title: "Lập trình Web Chuyên nghiệp",
    description: "Chứng chỉ xác nhận kỹ năng phát triển web hiện đại, bao gồm HTML, CSS, JavaScript và React.",
    duration: "180 giờ",
    level: "Trung cấp",
    requirements: ["Kiến thức cơ bản về lập trình", "Hoàn thành 10 bài kiểm tra", "Dự án cuối khóa"]
  },
  {
    id: "cert-2",
    title: "Phát triển Ứng dụng Di động",
    description: "Chứng chỉ chuyên sâu về phát triển ứng dụng di động đa nền tảng và native.",
    duration: "200 giờ",
    level: "Nâng cao",
    requirements: ["Kiến thức về JavaScript", "Hoàn thành 8 bài kiểm tra", "Phát triển 2 ứng dụng di động hoàn chỉnh"]
  },
  {
    id: "cert-3",
    title: "Khoa học Dữ liệu và AI",
    description: "Chứng chỉ về phân tích dữ liệu, machine learning và ứng dụng AI trong doanh nghiệp.",
    duration: "240 giờ",
    level: "Nâng cao",
    requirements: ["Kiến thức về Python", "Kiến thức cơ bản về thống kê", "Hoàn thành dự án phân tích dữ liệu thực tế"]
  }
];

const Certification = () => {
  const { toast } = useToast();
  
  const handleLearnMore = (programId: string) => {
    toast({
      title: "Thông tin chứng chỉ",
      description: `Đang mở thông tin chương trình chứng chỉ: ${programId}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Chương trình Chứng chỉ</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lấy chứng chỉ công nghệ được công nhận để nâng cao sự nghiệp của bạn. 
              Các chương trình chứng chỉ của chúng tôi được thiết kế bởi chuyên gia hàng đầu 
              trong ngành công nghiệp.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {certificatePrograms.map((program) => (
              <Card key={program.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-green-500"></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{program.title}</h3>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <Award className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{program.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Thời lượng:</span>
                      <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cấp độ:</span>
                      <span className="font-medium">{program.level}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Yêu cầu:</h4>
                    <ul className="space-y-1">
                      {program.requirements.map((req, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/courses`}>Xem khóa học</Link>
                    </Button>
                    <Button className="w-full" onClick={() => handleLearnMore(program.id)}>
                      Tìm hiểu thêm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Bạn đã sẵn sàng lấy chứng chỉ?</h2>
                    <p className="text-muted-foreground">
                      Đăng ký khóa học và bắt đầu hành trình học tập của bạn ngay hôm nay.
                    </p>
                  </div>
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600" asChild>
                    <Link to="/courses">Khám phá khóa học</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Certification;
