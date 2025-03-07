
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Menu, BookOpen, Check, FileText, Play, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import CodeMirror from '@/components/CodeMirror';

// Giả lập dữ liệu bài học (trong thực tế sẽ lấy từ API)
const lessonData = {
  id: "1-1",
  title: "HTML là gì?",
  type: "lesson",
  duration: "10 phút",
  content: `
  <h1>HTML là gì?</h1>
  <p>HTML (HyperText Markup Language) là ngôn ngữ đánh dấu siêu văn bản, là nền tảng cơ bản để tạo ra các trang web. HTML không phải là ngôn ngữ lập trình mà là ngôn ngữ đánh dấu, nó cho phép người dùng tạo và cấu trúc các phần của trang web như đoạn văn, tiêu đề, liên kết, trích dẫn và các thành phần khác.</p>
  
  <h2>Lịch sử HTML</h2>
  <p>HTML được tạo ra bởi Tim Berners-Lee vào năm 1991. Phiên bản đầu tiên HTML 1.0 rất đơn giản và chỉ hỗ trợ một số lượng giới hạn các thẻ. Qua thời gian, HTML đã phát triển và HTML5 là phiên bản mới nhất, cung cấp nhiều tính năng hơn cho việc phát triển web hiện đại.</p>
  
  <h2>Cấu trúc cơ bản của HTML</h2>
  <p>Một trang HTML cơ bản bao gồm các phần sau:</p>
  <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Tiêu đề trang&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Đây là tiêu đề&lt;/h1&gt;
    &lt;p&gt;Đây là đoạn văn.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

  <h2>Các thẻ HTML cơ bản</h2>
  <ul>
    <li><strong>&lt;html&gt;</strong>: Thẻ gốc của trang HTML</li>
    <li><strong>&lt;head&gt;</strong>: Chứa thông tin về trang web</li>
    <li><strong>&lt;title&gt;</strong>: Tiêu đề trang web</li>
    <li><strong>&lt;body&gt;</strong>: Chứa nội dung hiển thị trên trang web</li>
    <li><strong>&lt;h1&gt; đến &lt;h6&gt;</strong>: Các cấp độ tiêu đề</li>
    <li><strong>&lt;p&gt;</strong>: Đoạn văn</li>
    <li><strong>&lt;a&gt;</strong>: Liên kết</li>
    <li><strong>&lt;img&gt;</strong>: Hình ảnh</li>
  </ul>
  
  <h2>Ví dụ đơn giản</h2>
  <p>Đây là một ví dụ đơn giản về HTML để tạo một trang "Hello World":</p>
  `,
  codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Đây là trang HTML đầu tiên của tôi.</p>
</body>
</html>`,
  completed: false,
  courseId: "html-basics",
  chapterId: 1,
  nextLesson: "1-2",
  prevLesson: null,
  chapterTitle: "Giới Thiệu HTML"
};

// Dữ liệu của chương trình học (sidebar)
const courseStructure = [
  {
    id: 1,
    title: "Giới Thiệu HTML",
    lessons: [
      {
        id: "1-1",
        title: "HTML là gì?",
        type: "lesson",
        completed: true,
        current: true
      },
      {
        id: "1-2",
        title: "Cấu trúc của một trang HTML",
        type: "lesson",
        completed: false
      },
      {
        id: "1-3", 
        title: "Cài đặt môi trường phát triển",
        type: "lesson",
        completed: false
      },
      {
        id: "1-4",
        title: "Bài test chương 1",
        type: "test",
        completed: false
      }
    ]
  },
  {
    id: 2,
    title: "Thẻ HTML Cơ Bản",
    lessons: [
      {
        id: "2-1",
        title: "Thẻ tiêu đề và đoạn văn",
        type: "lesson",
        completed: false
      },
      {
        id: "2-2",
        title: "Thẻ định dạng văn bản",
        type: "lesson",
        completed: false
      },
      {
        id: "2-3",
        title: "Thẻ danh sách",
        type: "lesson",
        completed: false
      },
      {
        id: "2-4",
        title: "Thẻ liên kết và hình ảnh",
        type: "lesson",
        completed: false
      },
      {
        id: "2-5",
        title: "Bài test chương 2",
        type: "test",
        completed: false
      }
    ]
  }
];

const LessonDetail = () => {
  const { courseId, chapterId, lessonId } = useParams<{ courseId: string, chapterId: string, lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string>('');
  const [runCount, setRunCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Check if user tabs out (cheat detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && lessonData.type === 'test') {
        toast.warning("Chú ý! Việc chuyển tab sẽ bị ghi nhận là gian lận trong bài kiểm tra.", {
          duration: 5000,
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  useEffect(() => {
    // Trong thực tế, sẽ fetch dữ liệu từ API
    setLoading(true);
    
    // Giả lập API call
    setTimeout(() => {
      setLesson(lessonData);
      setCode(lessonData.codeExample || '');
      setLoading(false);
      
      // Scroll to top when lesson changes
      window.scrollTo(0, 0);
    }, 500);
  }, [courseId, chapterId, lessonId]);
  
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
  
  const markAsCompleted = () => {
    // Trong thực tế, sẽ gửi API call để đánh dấu bài học đã hoàn thành
    toast.success("Đã đánh dấu bài học là đã hoàn thành!");
    
    // Chuyển tới bài học tiếp theo
    if (lesson.nextLesson) {
      navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lesson.nextLesson}`);
    } else {
      navigate(`/course/${courseId}`);
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 phút
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [cheatAttempts, setCheatAttempts] = useState(0);
  
  // Dữ liệu bài kiểm tra mẫu (trong thực tế sẽ lấy từ API)
  const testData = {
    id: "1-4",
    title: "Bài kiểm tra chương 1",
    description: "Kiểm tra kiến thức về HTML cơ bản",
    totalQuestions: 10,
    timeLimit: 30, // phút
    questions: [
      {
        id: 1,
        question: "HTML là viết tắt của?",
        options: [
          "Hyper Text Markup Language",
          "High Tech Modern Language",
          "Hyper Transfer Markup Language",
          "Hyperlink Text Management Language"
        ],
        correctAnswer: "Hyper Text Markup Language"
      },
      {
        id: 2,
        question: "Thẻ nào được sử dụng để tạo tiêu đề lớn nhất trong HTML?",
        options: [
          "<h6>",
          "<heading>",
          "<h1>",
          "<head>"
        ],
        correctAnswer: "<h1>"
      },
      {
        id: 3,
        question: "Đâu là cách khai báo doctype chính xác cho HTML5?",
        options: [
          "<!DOCTYPE html>",
          "<DOCTYPE HTML5>",
          "<DOCTYPE html>",
          "<!DOCTYPE HTML5>"
        ],
        correctAnswer: "<!DOCTYPE html>"
      },
      {
        id: 4,
        question: "Thẻ nào được sử dụng để thêm hình ảnh vào trang web?",
        options: [
          "<picture>",
          "<image>",
          "<img>",
          "<src>"
        ],
        correctAnswer: "<img>"
      },
      {
        id: 5,
        question: "Thuộc tính nào được sử dụng để xác định URL của hình ảnh trong thẻ img?",
        options: [
          "link",
          "href",
          "url",
          "src"
        ],
        correctAnswer: "src"
      },
      {
        id: 6,
        question: "Thẻ nào được sử dụng để tạo danh sách có thứ tự trong HTML?",
        options: [
          "<dl>",
          "<ul>",
          "<ol>",
          "<list>"
        ],
        correctAnswer: "<ol>"
      },
      {
        id: 7,
        question: "Thẻ <br> được sử dụng để làm gì?",
        options: [
          "Tạo khoảng trắng",
          "Tạo dòng mới",
          "Tạo tab",
          "Tạo đoạn văn mới"
        ],
        correctAnswer: "Tạo dòng mới"
      },
      {
        id: 8,
        question: "Đâu không phải là thẻ block-level trong HTML?",
        options: [
          "<div>",
          "<span>",
          "<p>",
          "<h1>"
        ],
        correctAnswer: "<span>"
      },
      {
        id: 9,
        question: "Đâu là cách liên kết đến một trang web bên ngoài?",
        options: [
          "<a link='https://example.com'>Link</a>",
          "<a src='https://example.com'>Link</a>",
          "<a href='https://example.com'>Link</a>",
          "<a url='https://example.com'>Link</a>"
        ],
        correctAnswer: "<a href='https://example.com'>Link</a>"
      },
      {
        id: 10,
        question: "Đâu là thuộc tính khai báo văn bản thay thế cho hình ảnh trong HTML?",
        options: [
          "title",
          "alt",
          "description",
          "caption"
        ],
        correctAnswer: "alt"
      }
    ]
  };
  
  // Timer đếm ngược
  useEffect(() => {
    if (testSubmitted) return;
    
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
  }, [testSubmitted]);
  
  // Check if user tabs out (cheat detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !testSubmitted) {
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
  }, [testSubmitted]);
  
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
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const handleSubmit = () => {
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
    
    // Lưu kết quả bài kiểm tra (trong thực tế sẽ gửi API call)
    const testResult = {
      courseId,
      chapterId,
      testId: lessonId,
      score: finalScore,
      timeSpent: testData.timeLimit * 60 - timeLeft,
      cheatAttempts,
      answers,
      date: new Date().toISOString()
    };
    
    console.log("Test result:", testResult);
    // Trong thực tế, gửi API call để lưu kết quả
  };
  
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
              Bạn trả lời đúng {Object.keys(answers).filter(q => answers[parseInt(q)] === testData.questions[parseInt(q)].correctAnswer).length}/{testData.questions.length} câu hỏi
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
            {currentQ.options.map((option, index) => (
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
