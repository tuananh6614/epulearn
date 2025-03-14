import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChapterTest from '@/components/ChapterTest';
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const ChapterTestPage = () => {
  const { chapterId, courseId } = useParams<{ chapterId: string; courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const handleTestComplete = (score: number, total: number) => {
    const percentageScore = Math.round((score / total) * 100);
    
    if (percentageScore >= 70) {
      toast.success("Chúc mừng! Bạn đã hoàn thành bài kiểm tra");
    } else {
      toast.error("Bạn cần ôn tập lại và làm lại bài kiểm tra");
    }
  };
  
  const handleGoBack = () => {
    if (courseId) {
      navigate(`/course/${courseId}`);
    } else {
      navigate('/courses');
    }
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Bạn cần đăng nhập</h1>
            <p className="text-muted-foreground mb-6">
              Vui lòng đăng nhập để làm bài kiểm tra
            </p>
            <Button onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!chapterId || !courseId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Không tìm thấy bài kiểm tra</h1>
            <p className="text-muted-foreground mb-6">
              Bài kiểm tra bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
            </p>
            <Button onClick={() => navigate('/courses')}>
              Xem danh sách khóa học
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center gap-2" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại khóa học
          </Button>
          
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold">Bài Kiểm Tra Kiến Thức</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Hoàn thành bài kiểm tra dưới đây để kiểm tra mức độ hiểu bài của bạn.
              Bạn cần đạt tối thiểu 70% số câu đúng để vượt qua bài kiểm tra.
            </p>
          </div>
          
          <ChapterTest 
            chapterId={chapterId} 
            courseId={courseId}
            onComplete={handleTestComplete}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChapterTestPage;
