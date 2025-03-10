import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Menu, Check, FileText, Play, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import CodeMirror from '@/components/CodeMirror';
import { useToast } from "@/components/ui/use-toast";

// Interface cho dữ liệu bài học
interface LessonData {
  id: string;
  title: string;
  type: string;
  duration: string;
  content: string;
  codeExample?: string;
  completed: boolean;
  courseId: string;
  chapterId: number;
  nextLesson: string | null;
  prevLesson: string | null;
  chapterTitle: string;
}

// Interface cho cấu trúc chương
interface Chapter {
  id: number;
  title: string;
  lessons: {
    id: string;
    title: string;
    type: string;
    completed: boolean;
    current?: boolean;
  }[];
}

// Định nghĩa kiểu cho câu hỏi bài kiểm tra
interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Định nghĩa kiểu cho dữ liệu bài kiểm tra
interface TestData {
  title: string;
  description: string;
  timeLimit: number; // thời gian giới hạn theo phút
  questions: TestQuestion[];
}

const LessonDetail = () => {
  const { courseId, chapterId, lessonId } = useParams<{ courseId: string, chapterId: string, lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [courseStructure, setCourseStructure] = useState<Chapter[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string>('');
  const [runCount, setRunCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast: uiToast } = useToast();
  
  // API URLs
  const LESSON_API_URL = `http://localhost:3000/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`;
  const COURSE_STRUCTURE_API_URL = `/api/courses/${courseId}/structure`;
  
  // Check if user tabs out (cheat detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && lesson?.type === 'test') {
        toast.warning("Chú ý! Việc chuyển tab sẽ bị ghi nhận là gian lận trong bài kiểm tra.", {
          duration: 5000,
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lesson]);
  
  // Fetch lesson data và course structure
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch lesson data
        console.log('Fetching lesson data from:', LESSON_API_URL);
        const lessonResponse = await fetch(LESSON_API_URL);
        
        if (lessonResponse.ok) {
          const contentType = lessonResponse.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const lessonData = await lessonResponse.json();
            setLesson(lessonData);
            setCode(lessonData.codeExample || '');
          } else {
            console.error('Lesson response is not JSON:', await lessonResponse.text());
            throw new Error('API response is not JSON');
          }
        } else {
          throw new Error('Không thể tải bài học');
        }
        
        // Fetch course structure
        console.log('Fetching course structure from:', COURSE_STRUCTURE_API_URL);
        const structureResponse = await fetch(COURSE_STRUCTURE_API_URL);
        
        if (structureResponse.ok) {
          const contentType = structureResponse.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const structureData = await structureResponse.json();
            setCourseStructure(structureData);
          } else {
            console.error('Structure response is not JSON:', await structureResponse.text());
            throw new Error('API response is not JSON');
          }
        } else {
          throw new Error('Không thể tải cấu trúc khóa học');
        }
        
        setLoading(false);
        
        // Scroll to top when lesson changes
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        uiToast({
          title: "Lỗi tải dữ liệu",
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải dữ liệu",
          variant: "destructive",
        });
      }
    };
    
    if (courseId && chapterId && lessonId) {
      fetchData();
    }
  }, [courseId, chapterId, lessonId, LESSON_API_URL, COURSE_STRUCTURE_API_URL, uiToast]);
  
  const handleCodeChange = (value: string) => {
    setCode(value);
  };
  
  const runCode = () => {
    setRunCount(prev => prev + 1);
    try {
      // Hiển thị nội dung HTML
      setResult(code);
      toast.success("Code đã được chạy thành công!");
    } catch (error) {
      toast.error("Lỗi khi chạy code!");
      console.error(error);
    }
  };
  
  const markAsCompleted = async () => {
    try {
      // Gửi API call để đánh dấu bài học đã hoàn thành
      const markCompleteURL = `http://localhost:3000/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/complete`;
      console.log('Marking lesson as completed:', markCompleteURL);
      
      const response = await fetch(markCompleteURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể đánh dấu bài học đã hoàn thành');
      }
      
      toast.success("Đã đánh dấu bài học là đã hoàn thành!");
      
      // Chuyển tới bài học tiếp theo
      if (lesson?.nextLesson) {
        navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lesson.nextLesson}`);
      } else {
        navigate(`/course/${courseId}`);
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast.error("Lỗi khi đánh dấu hoàn thành bài học!");
      
      // Proceed anyway in case of API error
      if (lesson?.nextLesson) {
        navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lesson.nextLesson}`);
      } else {
        navigate(`/course/${courseId}`);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài học</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Bài học này không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Button onClick={() => navigate(`/course/${courseId}`)}>
              Quay lại khóa học
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 pt-16`}>
          <div className="p-4 h-full overflow-y-auto pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Nội dung khóa học</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <ChevronLeft />
              </Button>
            </div>
            
            <div className="space-y-6">
              {courseStructure.map((chapter) => (
                <div key={chapter.id}>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Chương {chapter.id}: {chapter.title}
                  </h3>
                  
                  <div className="space-y-1">
                    {chapter.lessons.map((item) => {
                      const isCurrentLesson = item.id === lessonId;
                      
                      return (
                        <Button
                          key={item.id}
                          variant={isCurrentLesson ? "default" : "ghost"}
                          className={`w-full justify-start text-left h-auto py-2 pl-2 pr-4 ${
                            isCurrentLesson ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" : ""
                          } ${
                            item.completed && !isCurrentLesson ? "text-green-600 dark:text-green-400" : ""
                          }`}
                          onClick={() => {
                            navigate(`/course/${courseId}/chapter/${chapter.id}/lesson/${item.id}`);
                            setSidebarOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            {item.completed ? (
                              <Check className="h-4 w-4 mr-2" />
                            ) : item.type === 'test' ? (
                              <FileText className="h-4 w-4 mr-2" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            <span className="truncate">{item.title}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:pl-80 w-full pt-16">
          {/* Top navigation */}
          <div className="sticky top-16 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden mr-2">
                <Menu />
              </Button>
              <div>
                <div className="text-sm text-muted-foreground">
                  Chương {lesson.chapterId}: {lesson.chapterTitle}
                </div>
                <h1 className="text-xl font-semibold">{lesson.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {lesson.prevLesson && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lesson.prevLesson}`)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Bài trước
                </Button>
              )}
              
              {lesson.nextLesson && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lesson.nextLesson}`)}>
                  Bài tiếp theo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Lesson content */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {lesson.type === 'lesson' ? (
                <>
                  <div 
                    ref={contentRef}
                    className="prose dark:prose-invert max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                  
                  {lesson.codeExample && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
                      <h3 className="text-lg font-medium mb-4">Thử nghiệm code</h3>
                      
                      <div className="mb-4">
                        <CodeMirror
                          value={code}
                          onChange={handleCodeChange}
                          height="300px"
                          theme="dark"
                          lang="html"
                        />
                      </div>
                      
                      <div className="flex justify-end mb-4">
                        <Button onClick={runCode}>
                          Chạy Code
                        </Button>
                      </div>
                      
                      {runCount > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Kết quả:</h4>
                          <div className="border rounded-md p-4 bg-white dark:bg-gray-900">
                            {result ? (
                              <iframe
                                srcDoc={result}
                                title="output"
                                className="w-full min-h-[200px] border-0"
                                sandbox="allow-scripts"
                              />
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400">Không có kết quả để hiển thị</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/course/${courseId}`)}
                    >
                      Quay lại khóa học
                    </Button>
                    
                    <Button onClick={markAsCompleted}>
                      {lesson.nextLesson ? "Hoàn thành & Tiếp tục" : "Hoàn thành bài học"}
                    </Button>
                  </div>
                </>
              ) : (
                <TestComponent courseId={courseId} chapterId={chapterId} lessonId={lessonId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component bài kiểm tra
const TestComponent = ({ courseId, chapterId, lessonId }: { courseId: string, chapterId: string, lessonId: string }) => {
  const navigate = useNavigate();
  // Sử dụng kiểu TestData thay cho any
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(0);  // Sẽ được cập nhật từ API
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [cheatAttempts, setCheatAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast: uiToast } = useToast();
  
  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const testUrl = `http://localhost:3000/api/courses/${courseId}/chapters/${chapterId}/tests/${lessonId}`;
        console.log('Fetching test data from:', testUrl);
        
        const response = await fetch(testUrl);
        
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data: TestData = await response.json();
            setTestData(data);
            setTimeLeft(data.timeLimit * 60); // Chuyển phút thành giây
          } else {
            console.error('Test response is not JSON:', await response.text());
            throw new Error('API response is not JSON');
          }
        } else {
          throw new Error('Không thể tải dữ liệu bài kiểm tra');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test data:', error);
        setLoading(false);
        uiToast({
          title: "Lỗi tải bài kiểm tra",
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải bài kiểm tra",
          variant: "destructive",
        });
      }
    };
    
    fetchTestData();
  }, [courseId, chapterId, lessonId, uiToast]);
  
  // Timer đếm ngược
  useEffect(() => {
    if (testSubmitted || loading || !testData) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testSubmitted, loading, testData]);
  
  // Check if user tabs out (cheat detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !testSubmitted && !loading) {
        setCheatAttempts(prev => prev + 1);
        toast.error("Cảnh báo! Bạn đã rời khỏi trang bài kiểm tra. Hành động này được ghi nhận là gian lận.", {
          duration: 5000,
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testSubmitted, loading]);
  
  // Format time từ giây sang mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };
  
  const handleNext = () => {
    if (testData && currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!testData) return;
    
    // Tính điểm
    let correctAnswers = 0;
    
    testData.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / testData.questions.length) * 100);
    setScore(finalScore);
    setTestSubmitted(true);
    
    // Lưu kết quả bài kiểm tra
    try {
      const submitUrl = `http://localhost:3000/api/courses/${courseId}/chapters/${chapterId}/tests/${lessonId}/submit`;
      console.log('Submitting test results to:', submitUrl);
      
      // Try to submit test results but continue if it fails
      try {
        const response = await fetch(submitUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score: finalScore,
            timeSpent: testData.timeLimit * 60 - timeLeft,
            cheatAttempts,
            answers,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Không thể gửi kết quả bài kiểm tra');
        }
        
        console.log('Test results submitted successfully');
      } catch (error) {
        console.error('Error submitting test results:', error);
        toast.error("Lỗi khi gửi kết quả bài kiểm tra!");
      }
    } catch (error) {
      console.error('Error in submit test logic:', error);
      toast.error("Lỗi khi gửi kết quả bài kiểm tra!");
    }
  };
  
  if (loading) {
    return (
      <div className="animate-pulse p-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!testData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài kiểm tra</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Bài kiểm tra này không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => navigate(`/course/${courseId}`)}>
          Quay lại khóa học
        </Button>
      </div>
    );
  }
  
  // Hiển thị kết quả sau khi nộp bài
  if (testSubmitted) {
    return (
      <div className="test-container">
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Bài kiểm tra đã hoàn thành!</h2>
          <p className="text-muted-foreground mb-6">Cảm ơn bạn đã hoàn thành bài kiểm tra này</p>
          
          <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-8">
            <div className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">{score}%</div>
            <p className="text-muted-foreground">
              Bạn trả lời đúng {Object.keys(answers).filter(q => testData.questions[parseInt(q)] && answers[parseInt(q)] === testData.questions[parseInt(q)].correctAnswer).length}/{testData.questions.length} câu hỏi
            </p>
            
            <Separator className="my-4" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Thời gian làm bài:</span>
                <span>{Math.floor((testData.timeLimit * 60 - timeLeft) / 60)} phút {(testData.timeLimit * 60 - timeLeft) % 60} giây</span>
              </div>
              <div className="flex justify-between">
                <span>Số lần chuyển tab:</span>
                <span className={cheatAttempts > 0 ? "text-red-500" : ""}>{cheatAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Đạt yêu cầu:</span>
                <span className={score >= 70 ? "text-green-500" : "text-red-500"}>
                  {score >= 70 ? "Đạt" : "Chưa đạt"}
                </span>
              </div>
            </div>
          </div>
          
          {score < 70 && (
            <div className="mb-8 p-4 border border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-900/10 rounded-md text-yellow-800 dark:text-yellow-400">
              <p>Bạn cần đạt ít nhất 70% để vượt qua bài kiểm tra này. Hãy ôn tập và thử lại.</p>
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
              Quay lại khóa học
            </Button>
            
            {score < 70 && (
              <Button onClick={() => {
                setTestSubmitted(false);
                setCurrentQuestion(0);
                setTimeLeft(testData.timeLimit * 60);
                setCheatAttempts(0);
              }}>
                Làm lại bài kiểm tra
              </Button>
            )}
            
            {score >= 70 && (
              <Button onClick={() => navigate(`/course/${courseId}`)}>
                Tiếp tục học
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  const currentQ = testData.questions[currentQuestion];
  
  return (
    <div className="test-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{testData.title}</h2>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full ${timeLeft < 300 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'}`}>
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
          <Badge variant="outline">
            Câu {currentQuestion + 1}/{testData.questions.length}
          </Badge>
        </div>
      </div>
      
      <p className="mb-2 text-muted-foreground">{testData.description}</p>
      
      <Progress value={(currentQuestion + 1) / testData.questions.length * 100} className="mb-8" />
      
      <div>
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Câu {currentQuestion + 1}: {currentQ.question}</h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option: string, index: number) => (
              <div 
                key={index}
                className={`p-3 border rounded-md cursor-pointer transition-all ${
                  answers[currentQuestion] === option 
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
                onClick={() => handleAnswerSelect(option)}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                    answers[currentQuestion] === option 
                      ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {answers[currentQuestion] === option && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Câu trước
          </Button>
          
          <div>
            {currentQuestion === testData.questions.length - 1 ? (
              <Button onClick={handleSubmit}>
                Nộp bài
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Câu tiếp theo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
