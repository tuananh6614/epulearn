
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { fetchCourseTests } from '@/integrations/supabase/client';
import CourseTestForm from '@/components/CourseTestForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Clock, FileText, Book } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CourseTestProps {}

const CourseTest: React.FC<CourseTestProps> = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadTests = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const testsData = await fetchCourseTests(courseId);
        console.log('Tests data:', testsData);
        setTests(testsData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load tests:', error);
        toast.error('Không thể tải bài kiểm tra');
        setLoading(false);
      }
    };
    
    loadTests();
  }, [courseId]);
  
  const handleTestSelect = (test: any) => {
    setSelectedTest(test);
  };
  
  const handleTestComplete = async (score: number, passed: boolean) => {
    if (!user || !courseId || !selectedTest) return;
    
    try {
      // Save test result to database
      const { error } = await supabase
        .from('user_test_results')
        .insert({
          user_id: user.id,
          course_id: courseId,
          course_test_id: selectedTest.id,
          score,
          passed,
          time_taken: Math.floor(selectedTest.time_limit * 60),
        });
        
      if (error) throw error;
      
      toast.success(passed ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra' : 'Bạn chưa đạt điểm yêu cầu cho bài kiểm tra này');
    } catch (error) {
      console.error('Failed to save test result:', error);
      toast.error('Không thể lưu kết quả bài kiểm tra');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
        {selectedTest ? (
          <div className="max-w-3xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTest(null)}
              className="mb-6"
            >
              ← Quay lại danh sách bài kiểm tra
            </Button>
            <CourseTestForm 
              test={selectedTest} 
              courseId={courseId || ''} 
              onComplete={handleTestComplete} 
            />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Bài kiểm tra</h1>
              <p className="text-muted-foreground mt-2">Hoàn thành bài kiểm tra để đánh giá kiến thức của bạn</p>
            </div>
            
            {tests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">Chưa có bài kiểm tra nào</p>
                  <p className="text-muted-foreground mt-1">Khóa học này chưa có bài kiểm tra tổng quát.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate(`/course/${courseId}`)}
                  >
                    Quay lại khóa học
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => (
                  <Card key={test.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{test.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {test.description || 'Đánh giá kiến thức của bạn về chủ đề này'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{test.questions?.length || 0} câu hỏi</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{test.time_limit} phút</span>
                        </div>
                        <div className="flex items-center">
                          <Book className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Điểm đạt: {test.passing_score}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="pt-4">
                      <Button 
                        className="w-full" 
                        onClick={() => handleTestSelect(test)}
                      >
                        Bắt đầu làm bài
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="mt-10">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/course/${courseId}`)}
              >
                Quay lại khóa học
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseTest;
