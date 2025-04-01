import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Play, PlayCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useToast } from "@/components/ui/use-toast";
import { LessonData } from '@/models/lesson';

const LessonDemo = () => {
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  
  useEffect(() => {
    const fetchDemoLesson = async () => {
      try {
        setLoading(true);
        console.log('Fetching demo lesson data...');
        
        const response = await fetch('http://localhost:3000/api/lesson-demo');
        
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            console.log('API data received:', data);
            setLessonData(data);
          } else {
            console.error('Response is not JSON:', await response.text());
            throw new Error('API response is not JSON');
          }
        } else {
          throw new Error(`API request failed with status ${response.status}`);
        }
      } catch (err) {
        console.error('Error in demo lesson logic:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        uiToast({
          title: "Lỗi tải bài học demo",
          description: err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải bài học demo",
          variant: "destructive",
        });
        
        // Fallback to dummy data if API fails
        const dummyLesson: LessonData = {
          id: "demo-lesson",
          title: "Bài Học Demo",
          content: "<h2>Đây là nội dung bài học demo</h2><p>Nội dung bài học sẽ hiển thị ở đây.</p>",
          courseId: "demo-course",
          duration: "15 phút",
          description: "Bài học demo để giới thiệu giao diện học tập",
          courseStructure: [
            {
              id: "1",
              title: "Chương Demo",
              lessons: [
                {
                  id: "1",
                  title: "Bài 1: Giới thiệu",
                  type: "lesson",
                  completed: false,
                  current: true
                },
                {
                  id: "2",
                  title: "Bài 2: Nâng cao",
                  type: "lesson",
                  completed: false
                }
              ]
            }
          ],
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        };
        
        setLessonData(dummyLesson);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoLesson();
  }, [uiToast]);
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => toast.success("Đã sao chép mã vào clipboard"))
      .catch(() => toast.error("Không thể sao chép mã"));
  };
  
  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = optionIndex;
    setQuizAnswers(newAnswers);
  };
  
  const handleSubmitQuiz = () => {
    if (!lessonData || !lessonData.quiz) return;
    
    if (quizAnswers.length !== lessonData.quiz.length) {
      toast.error("Vui lòng trả lời tất cả các câu hỏi");
      return;
    }
    
    let correctCount = 0;
    quizAnswers.forEach((answer, index) => {
      if (answer === lessonData.quiz![index].correctAnswer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / lessonData.quiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    
    if (score >= 70) {
      toast.success(`Chúc mừng! Bạn đã đạt ${score}% câu hỏi đúng`);
    } else {
      toast.error(`Bạn chỉ đạt ${score}%. Hãy xem lại bài học và thử lại`);
    }
  };
  
  const handleResetQuiz = () => {
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mt-8"></div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (error && !lessonData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Không thể tải bài học demo</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (!lessonData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Không có dữ liệu bài học demo</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Vui lòng thử lại sau</p>
              <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="bg-gray-100 dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Link to="/courses" className="text-blue-500 hover:text-blue-700 flex items-center text-sm mb-1">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Quay lại {lessonData.courseId}
                </Link>
                <h1 className="text-2xl font-bold">{lessonData.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {lessonData.duration}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/courses">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Bài trước
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/courses">
                    Bài tiếp
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="flex border-b">
                  <button
                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('content')}
                  >
                    Nội dung bài học
                  </button>
                  {lessonData.quiz && lessonData.quiz.length > 0 && (
                    <button
                      className={`px-4 py-3 text-sm font-medium ${activeTab === 'quiz' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('quiz')}
                    >
                      Bài kiểm tra
                    </button>
                  )}
                  {lessonData.videoUrl && (
                    <button
                      className={`px-4 py-3 text-sm font-medium ${activeTab === 'video' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('video')}
                    >
                      Video
                    </button>
                  )}
                </div>
                
                <div className="p-6">
                  {activeTab === 'content' && (
                    <div className="lesson-content prose dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: lessonData.content }} />
                      
                      <script
                        dangerouslySetInnerHTML={{
                          __html: `
                            document.querySelectorAll('pre').forEach(pre => {
                              const copyButton = document.createElement('button');
                              copyButton.className = 'copy-button';
                              copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                              pre.style.position = 'relative';
                              pre.appendChild(copyButton);
                              
                              copyButton.addEventListener('click', () => {
                                const code = pre.querySelector('code').innerText;
                                navigator.clipboard.writeText(code);
                                copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                                setTimeout(() => {
                                  copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                                }, 2000);
                              });
                            });
                          `
                        }}
                      />
                    </div>
                  )}
                  
                  {activeTab === 'quiz' && lessonData.quiz && lessonData.quiz.length > 0 && (
                    <div className="quiz-container">
                      <h2 className="text-xl font-bold mb-6">
                        Kiểm tra kiến thức
                      </h2>
                      
                      {quizSubmitted && (
                        <div className={`mb-6 p-4 rounded-lg ${quizScore >= 70 ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                          <div className="flex items-center mb-2">
                            {quizScore >= 70 ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center mr-2">
                                <span className="text-xs font-bold">✕</span>
                              </div>
                            )}
                            <h3 className="font-semibold">
                              {quizScore >= 70 ? 'Chúc mừng!' : 'Hãy thử lại!'}
                            </h3>
                          </div>
                          <p className={quizScore >= 70 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                            {quizScore >= 70 
                              ? `Bạn đã đạt ${quizScore}% câu hỏi đúng và hoàn thành bài kiểm tra.`
                              : `Bạn chỉ đạt ${quizScore}%. Hãy xem lại bài học và thử lại.`}
                          </p>
                          
                          <div className="mt-3">
                            <Button 
                              variant={quizScore >= 70 ? "outline" : "default"}
                              className={quizScore >= 70 ? "" : "bg-red-500 hover:bg-red-600"}
                              onClick={handleResetQuiz}
                            >
                              {quizScore >= 70 ? 'Làm lại bài kiểm tra' : 'Thử lại'}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-8">
                        {lessonData.quiz.map((quizItem, qIndex) => (
                          <div key={qIndex} className="quiz-question">
                            <h3 className="font-medium mb-4">
                              Câu {qIndex + 1}: {quizItem.question}
                            </h3>
                            <div className="space-y-2">
                              {quizItem.options.map((option, oIndex) => (
                                <div 
                                  key={oIndex}
                                  className={`p-3 border rounded-lg cursor-pointer transition-colors
                                    ${!quizSubmitted && quizAnswers[qIndex] === oIndex ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                                    ${quizSubmitted && oIndex === quizItem.correctAnswer ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                                    ${quizSubmitted && quizAnswers[qIndex] === oIndex && oIndex !== quizItem.correctAnswer ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                                  `}
                                  onClick={() => handleSelectAnswer(qIndex, oIndex)}
                                >
                                  <div className="flex items-start">
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mr-3 mt-0.5
                                      ${quizAnswers[qIndex] === oIndex ? 'border-blue-500 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}
                                    `}>
                                      {quizAnswers[qIndex] === oIndex && (
                                        <div className={`w-2 h-2 rounded-full ${quizSubmitted && oIndex !== quizItem.correctAnswer ? 'bg-red-500' : 'bg-blue-500 dark:bg-blue-400'}`}></div>
                                      )}
                                    </div>
                                    <span>{option}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {!quizSubmitted && (
                        <div className="mt-8">
                          <Button onClick={handleSubmitQuiz} disabled={quizAnswers.length !== lessonData.quiz.length}>
                            Nộp bài
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'video' && lessonData.videoUrl && (
                    <div className="video-container">
                      <div className="aspect-w-16 aspect-h-9">
                        <iframe
                          src={lessonData.videoUrl}
                          className="w-full h-[400px] rounded-lg"
                          title={lessonData.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      
                      <div className="mt-6">
                        <h2 className="text-xl font-bold mb-2">{lessonData.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          {lessonData.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
                <h3 className="font-bold mb-4">Nội dung khóa học</h3>
                
                <div className="space-y-4">
                  {lessonData.courseStructure && lessonData.courseStructure.map((chapter, index) => (
                    <div key={index} className="chapter">
                      <h4 className="font-medium text-sm mb-2">Chương {index + 1}: {chapter.title}</h4>
                      <div className="space-y-1">
                        {chapter.lessons.map((lessonItem, lIndex) => (
                          <div 
                            key={lIndex} 
                            className={`p-2 rounded text-sm flex items-center ${
                              lessonItem.current 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                                : 'text-gray-500'
                            }`}
                          >
                            {lessonItem.current ? (
                              <PlayCircle className="h-4 w-4 mr-2" />
                            ) : (
                              <Lock className="h-4 w-4 mr-2" />
                            )}
                            <span>{lessonItem.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button className="w-full flex items-center justify-center" asChild>
                    <Link to="/signup">
                      Đăng ký để mở khóa
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LessonDemo;
