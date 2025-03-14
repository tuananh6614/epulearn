
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { 
  fetchCourseTests, 
  saveTestResult, 
  getUserTestResults,
  CourseTest as CourseTestType,
  TestResult
} from '@/integrations/supabase';
import { supabase } from '@/integrations/supabase/client';
import CourseTestForm from '@/components/CourseTestForm';
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
import { Clock, FileText, Book, AlertCircle, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// ========================
// COMPONENT CHÍNH
// ========================
const CourseTest: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // State variables with proper typing
  const [tests, setTests] = useState<CourseTestType[]>([]);
  const [selectedTest, setSelectedTest] = useState<CourseTestType | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousResults, setPreviousResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState("tests");

  const { user } = useAuth();

  useEffect(() => {
    const loadTests = async () => {
      if (!courseId) return;

      try {
        setLoading(true);

        // Fetch course tests with the expected return type
        const testsData = await fetchCourseTests(courseId);
        setTests(testsData);

        // Load user's previous test results if logged in
        if (user) {
          const resultsData = await getUserTestResults(user.id, courseId);
          setPreviousResults(resultsData);
        }
      } catch (error) {
        console.error('Failed to load tests:', error);
        toast.error('Không thể tải bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [courseId, user]);

  // Chọn bài kiểm tra
  const handleTestSelect = (test: CourseTestType) => {
    setSelectedTest(test);
  };

  // Xử lý khi người dùng hoàn thành bài kiểm tra
  const handleTestComplete = async (score: number, passed: boolean, timeTaken: number, answers: Record<string, number>) => {
    if (!user || !courseId || !selectedTest) return;

    try {
      const result = await saveTestResult(
        user.id,
        courseId,
        selectedTest.id,
        score,
        passed,
        timeTaken,
        answers
      );

      if (result.success) {
        toast.success(
          passed
            ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra'
            : 'Bạn chưa đạt điểm yêu cầu cho bài kiểm tra này'
        );

        // Reload test results
        const resultsData = await getUserTestResults(user.id, courseId);
        setPreviousResults(resultsData);
      } else {
        toast.error('Không thể lưu kết quả bài kiểm tra');
      }
    } catch (error) {
      console.error('Failed to save test result:', error);
      toast.error('Không thể lưu kết quả bài kiểm tra');
    }
  };

  // Kiểm tra người dùng đã ghi danh (enrolled) hay chưa
  const checkEnrollment = async (): Promise<boolean> => {
    if (!user || !courseId) return false;

    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error) {
        console.error('Error checking enrollment:', error);
        return false;
      }
      return !!data;
    } catch (error) {
      console.error('Failed to check enrollment:', error);
      return false;
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: vi 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Hiển thị loading
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

  // Giao diện chính
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
            {/* Tiêu đề */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Bài kiểm tra</h1>
              <p className="text-muted-foreground mt-2">
                Hoàn thành bài kiểm tra để đánh giá kiến thức của bạn
              </p>
            </div>

            {/* Cảnh báo đăng nhập */}
            {!user && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bạn cần đăng nhập để tham gia và lưu kết quả bài kiểm tra
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="tests" className="mb-8" onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="tests">Danh sách bài kiểm tra</TabsTrigger>
                <TabsTrigger value="results" disabled={!user || previousResults.length === 0}>
                  Kết quả của bạn {previousResults.length > 0 && `(${previousResults.length})`}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tests">
                {tests.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-lg font-medium">Chưa có bài kiểm tra nào</p>
                      <p className="text-muted-foreground mt-1">
                        Khóa học này chưa có bài kiểm tra tổng quát.
                      </p>
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
                    {tests.map((test) => {
                      // Tìm kết quả tốt nhất (nếu có)
                      const testResults = previousResults.filter(
                        (r) => r.course_test_id === test.id
                      );
                      const bestResult =
                        testResults.length > 0
                          ? testResults.reduce((prev, current) =>
                              prev.score > current.score ? prev : current
                            )
                          : null;

                      return (
                        <Card
                          key={test.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader>
                            <CardTitle>{test.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {test.description ||
                                'Đánh giá kiến thức của bạn về chủ đề này'}
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

                              {bestResult && (
                                <div
                                  className={`px-3 py-1 mt-2 text-xs rounded-full ${
                                    bestResult.passed
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                  }`}
                                >
                                  {bestResult.passed
                                    ? `Đã hoàn thành với ${bestResult.score}%`
                                    : `Chưa đạt - ${bestResult.score}%`}
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <Separator />
                          <CardFooter className="pt-4">
                            <Button
                              className="w-full"
                              onClick={() => handleTestSelect(test)}
                            >
                              {bestResult?.passed
                                ? 'Làm lại bài kiểm tra'
                                : 'Bắt đầu làm bài'}
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="results">
                {previousResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Lịch sử làm bài kiểm tra</h2>
                      <p className="text-sm text-muted-foreground">
                        Tổng số: {previousResults.length} lần kiểm tra
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {previousResults.map((result) => {
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
                                {formatDate(result.created_at)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>Điểm số: <span className="font-medium">{result.score}%</span></span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>Thời gian: <span className="font-medium">
                                    {result.time_taken ? `${Math.floor(result.time_taken / 60)}:${(result.time_taken % 60).toString().padStart(2, '0')}` : "N/A"}
                                  </span></span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  const matchingTest = tests.find(t => t.id === result.course_test_id);
                                  if (matchingTest) {
                                    handleTestSelect(matchingTest);
                                  } else {
                                    toast.error("Không tìm thấy bài kiểm tra");
                                  }
                                }}
                              >
                                Làm lại bài kiểm tra
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-lg font-medium">Chưa có kết quả kiểm tra</p>
                      <p className="text-muted-foreground mt-1">
                        Bạn chưa hoàn thành bài kiểm tra nào trong khóa học này.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setActiveTab("tests")}
                      >
                        Xem danh sách bài kiểm tra
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-10">
              <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
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
