
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { 
  getUserTestResults,
  fetchCourseTests,
  TestResult,
  CourseTest
} from '@/integrations/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Trophy, TrendingUp, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TestResultsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<TestResult[]>([]);
  const [tests, setTests] = useState<CourseTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !courseId) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch test results and tests concurrently
        const [resultsData, testsData] = await Promise.all([
          getUserTestResults(user.id, courseId),
          fetchCourseTests(courseId)
        ]);
        
        setResults(resultsData);
        setTests(testsData);
      } catch (error) {
        console.error('Error loading test results:', error);
        toast.error('Không thể tải kết quả bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, courseId, navigate]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };
  
  // Prepare data for charts
  const prepareChartData = () => {
    if (!results.length) return [];
    
    return results.map((result, index) => {
      const test = tests.find(t => t.id === result.course_test_id);
      return {
        name: `Lần ${index + 1}`,
        score: result.score,
        passingScore: test?.passing_score || 70,
        date: result.created_at ? format(new Date(result.created_at), 'dd/MM') : `Lần ${index + 1}`
      };
    }).reverse();
  };
  
  // Calculate progress metrics
  const calculateMetrics = () => {
    if (!results.length) {
      return { 
        bestScore: 0, 
        averageScore: 0, 
        passRate: 0,
        improvement: 0
      };
    }
    
    const scores = results.map(r => r.score);
    const bestScore = Math.max(...scores);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const passRate = Math.round((results.filter(r => r.passed).length / results.length) * 100);
    
    // Calculate improvement (difference between first and last attempt)
    let improvement = 0;
    if (results.length >= 2) {
      // Sort by date
      const sortedResults = [...results].sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      
      improvement = sortedResults[sortedResults.length - 1].score - sortedResults[0].score;
    }
    
    return { bestScore, averageScore, passRate, improvement };
  };
  
  const chartData = prepareChartData();
  const metrics = calculateMetrics();
  
  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded mt-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded"></div>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thống kê bài kiểm tra</h1>
            <p className="text-muted-foreground mt-2">
              Theo dõi tiến trình học tập qua các bài kiểm tra của bạn
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/course/${courseId}/test`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại bài kiểm tra
          </Button>
        </div>
        
        {results.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium">Chưa có kết quả kiểm tra</p>
              <p className="text-muted-foreground mt-1 mb-6">
                Bạn chưa hoàn thành bài kiểm tra nào trong khóa học này.
              </p>
              <Button onClick={() => navigate(`/course/${courseId}/test`)}>
                Làm bài kiểm tra ngay
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Điểm cao nhất</p>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold">{metrics.bestScore}%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Điểm trung bình</p>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{metrics.averageScore}%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Tỷ lệ đạt</p>
                    <Clock className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{metrics.passRate}%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Tiến bộ</p>
                    <Calendar className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: metrics.improvement >= 0 ? 'var(--color-green-500)' : 'var(--color-red-500)' }}>
                    {metrics.improvement > 0 ? '+' : ''}{metrics.improvement}%
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="progress">
              <TabsList className="mb-6">
                <TabsTrigger value="progress">Tiến trình</TabsTrigger>
                <TabsTrigger value="attempts">Lịch sử làm bài</TabsTrigger>
              </TabsList>
              
              <TabsContent value="progress">
                <Card>
                  <CardHeader>
                    <CardTitle>Biểu đồ tiến trình</CardTitle>
                    <CardDescription>
                      Theo dõi điểm số qua các lần làm bài kiểm tra
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip formatter={(value) => [`${value}%`]} />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            name="Điểm số"
                            stroke="var(--color-primary)" 
                            strokeWidth={2} 
                            activeDot={{ r: 8 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="passingScore" 
                            name="Điểm đạt yêu cầu"
                            stroke="#888" 
                            strokeDasharray="5 5" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attempts">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử làm bài</CardTitle>
                    <CardDescription>
                      Chi tiết các lần kiểm tra trong khóa học này
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results
                        .sort((a, b) => {
                          if (!a.created_at || !b.created_at) return 0;
                          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        })
                        .map((result) => {
                          const test = tests.find(t => t.id === result.course_test_id);
                          return (
                            <Card key={result.id} className="border-l-4 border-l-primary">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">
                                    {test?.title || "Bài kiểm tra"}
                                  </CardTitle>
                                  <div className={`px-2 py-1 text-xs rounded-full ${
                                    result.passed
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {result.passed ? "Đạt" : "Chưa đạt"}
                                  </div>
                                </div>
                                <CardDescription className="text-sm">
                                  {result.created_at ? formatDistanceToNow(new Date(result.created_at), { 
                                    addSuffix: true,
                                    locale: vi 
                                  }) : 'N/A'}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="py-2">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Điểm số</p>
                                    <p className="font-medium">{result.score}%</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Thời gian</p>
                                    <p className="font-medium">
                                      {result.time_taken 
                                        ? `${Math.floor(result.time_taken / 60)}:${(result.time_taken % 60).toString().padStart(2, '0')}`
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Ngày làm bài</p>
                                    <p className="font-medium">{formatDate(result.created_at)}</p>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/course/${courseId}/test`)}
                                >
                                  Thử lại bài kiểm tra
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default TestResultsPage;
