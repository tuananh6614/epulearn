
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ChevronRight, Clock, Trophy, LineChart } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface TestResult {
  id: string;
  user_id: string;
  course_id: string;
  chapter_id: string;
  score: number;
  passed: boolean;
  created_at: string;
  chapter_title?: string;
}

const TestHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>('');
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchTestHistory = async () => {
      setLoading(true);
      
      try {
        // Fetch course info
        if (courseId) {
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('title')
            .eq('id', courseId)
            .single();
            
          if (!courseError && courseData) {
            setCourseTitle(courseData.title);
          }
        }
        
        // Construct query based on whether courseId is provided
        let query = supabase
          .from('user_test_results')
          .select(`
            id,
            user_id,
            course_id,
            chapter_id,
            score,
            passed,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (courseId) {
          query = query.eq('course_id', courseId);
        }
        
        // Execute query
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching test history:', error);
          return;
        }
        
        if (data) {
          // Get chapter titles for all chapter IDs
          const chapterIds = [...new Set(data.map(result => result.chapter_id))];
          
          const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('id, title')
            .in('id', chapterIds);
            
          if (chaptersError) {
            console.error('Error fetching chapter titles:', chaptersError);
          }
          
          // Map chapter titles to test results
          const resultsWithChapterTitles = data.map(result => {
            const chapter = chaptersData?.find(c => c.id === result.chapter_id);
            return {
              ...result,
              chapter_title: chapter?.title || 'Chương không xác định'
            };
          });
          
          setTestResults(resultsWithChapterTitles);
        }
      } catch (error) {
        console.error('Error fetching test history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestHistory();
  }, [user, courseId, navigate]);
  
  // Group test results by chapter for the performance chart
  const getChartData = () => {
    const chapterResults: Record<string, TestResult[]> = {};
    
    // Group results by chapter
    testResults.forEach(result => {
      if (!chapterResults[result.chapter_id]) {
        chapterResults[result.chapter_id] = [];
      }
      chapterResults[result.chapter_id].push(result);
    });
    
    // Get the latest 10 attempts for each chapter, in chronological order
    const chartData: any[] = [];
    
    Object.entries(chapterResults).forEach(([chapterId, results]) => {
      const sortedResults = [...results].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      const latestResults = sortedResults.slice(Math.max(0, sortedResults.length - 10));
      
      latestResults.forEach((result, index) => {
        chartData.push({
          name: `${result.chapter_title} #${index + 1}`,
          score: result.score,
          date: format(new Date(result.created_at), 'dd/MM/yyyy'),
          chapter: result.chapter_title,
          passed: result.passed
        });
      });
    });
    
    return chartData;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(courseId ? `/course/${courseId}` : '/courses')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {courseId ? 'Quay lại khóa học' : 'Quay lại danh sách khóa học'}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {courseId ? `Lịch sử kiểm tra: ${courseTitle}` : 'Lịch sử kiểm tra của bạn'}
          </h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : testResults.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Chưa có lịch sử kiểm tra</CardTitle>
              <CardDescription className="text-center">
                Bạn chưa thực hiện bài kiểm tra nào{courseId ? ' trong khóa học này' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => navigate(courseId ? `/course/${courseId}` : '/courses')}
                className="mt-4"
              >
                {courseId ? 'Quay lại khóa học' : 'Xem danh sách khóa học'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" />
                  Biểu đồ tiến độ
                </CardTitle>
                <CardDescription>Điểm số qua các lần làm bài kiểm tra</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 75 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Điểm']}
                        labelFormatter={(label) => {
                          const item = getChartData().find(item => item.name === label);
                          return `${item?.chapter} - ${item?.date}`;
                        }}
                      />
                      <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" >
                        <label position="insideBottomRight" value="Đạt" offset={-20} fill="red" />
                      </ReferenceLine>
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#2563eb" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Lịch sử bài kiểm tra</h2>
            
            <div className="space-y-4">
              {testResults.map((result) => (
                <Card key={result.id} className="overflow-hidden">
                  <div className={`h-1 ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{result.chapter_title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(result.created_at), 'EEEE, dd MMMM yyyy, HH:mm', { locale: vi })}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        {result.passed && (
                          <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                        )}
                        <span className={`text-lg font-bold ${
                          result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {result.score}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Kết quả:</span>
                        <span className={result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {result.passed ? 'Đạt' : 'Chưa đạt'}
                        </span>
                      </div>
                      <Progress 
                        value={result.score} 
                        className="h-2" 
                        indicatorClassName={result.passed ? 'bg-green-500' : 'bg-red-500'}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHistoryPage;
