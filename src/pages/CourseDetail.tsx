
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, BookOpen, Check, Lock, Play, FileText, Code, Award, Trophy } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dữ liệu khóa học mẫu (trong thực tế sẽ lấy từ API)
const courseData = {
  id: "html-basics",
  title: "HTML Cơ Bản",
  description: "Học những kiến thức nền tảng của HTML để tạo trang web có cấu trúc.",
  fullDescription: "Khóa học HTML cơ bản này sẽ giúp bạn hiểu rõ về ngôn ngữ đánh dấu siêu văn bản - nền tảng của mọi trang web. Bạn sẽ học cách tạo các trang web có cấu trúc, sử dụng các thẻ HTML để định dạng nội dung, thêm hình ảnh, liên kết và các thành phần tương tác khác.",
  level: "Người Mới",
  duration: "4 tuần",
  totalLessons: 24,
  totalTests: 8,
  image: "/placeholder.svg",
  color: "linear-gradient(90deg, #48BB78 0%, #38A169 100%)",
  requirements: [
    "Không yêu cầu kiến thức lập trình trước đó",
    "Hiểu biết cơ bản về cách sử dụng máy tính",
    "Trình duyệt web và trình soạn thảo code đơn giản"
  ],
  objectives: [
    "Hiểu rõ cấu trúc của một trang HTML",
    "Thành thạo sử dụng các thẻ HTML thông dụng",
    "Tạo các biểu mẫu và xử lý dữ liệu người dùng",
    "Hiểu về HTML5 và các tính năng mới"
  ],
  chapters: [
    {
      id: 1,
      title: "Giới Thiệu HTML",
      description: "Tìm hiểu về HTML và cách thức hoạt động của web",
      lessons: [
        {
          id: "1-1",
          title: "HTML là gì?",
          type: "lesson",
          duration: "10 phút",
          completed: true
        },
        {
          id: "1-2",
          title: "Cấu trúc của một trang HTML",
          type: "lesson",
          duration: "15 phút",
          completed: true
        },
        {
          id: "1-3", 
          title: "Cài đặt môi trường phát triển",
          type: "lesson",
          duration: "20 phút",
          completed: false
        },
        {
          id: "1-4",
          title: "Bài test chương 1",
          type: "test",
          duration: "30 phút",
          completed: false,
          questions: 10
        }
      ]
    },
    {
      id: 2,
      title: "Thẻ HTML Cơ Bản",
      description: "Các thẻ HTML thông dụng và cách sử dụng",
      lessons: [
        {
          id: "2-1",
          title: "Thẻ tiêu đề và đoạn văn",
          type: "lesson",
          duration: "15 phút",
          completed: false
        },
        {
          id: "2-2",
          title: "Thẻ định dạng văn bản",
          type: "lesson",
          duration: "20 phút",
          completed: false
        },
        {
          id: "2-3",
          title: "Thẻ danh sách",
          type: "lesson",
          duration: "15 phút",
          completed: false
        },
        {
          id: "2-4",
          title: "Thẻ liên kết và hình ảnh",
          type: "lesson",
          duration: "25 phút",
          completed: false
        },
        {
          id: "2-5",
          title: "Bài test chương 2",
          type: "test",
          duration: "45 phút",
          completed: false,
          questions: 15
        }
      ]
    },
    {
      id: 3,
      title: "Biểu Mẫu và Bảng",
      description: "Tạo biểu mẫu và bảng dữ liệu",
      lessons: [
        {
          id: "3-1",
          title: "Tạo bảng dữ liệu",
          type: "lesson",
          duration: "25 phút",
          completed: false
        },
        {
          id: "3-2",
          title: "Biểu mẫu cơ bản",
          type: "lesson",
          duration: "20 phút",
          completed: false
        },
        {
          id: "3-3",
          title: "Các loại input trong form",
          type: "lesson",
          duration: "30 phút",
          completed: false
        },
        {
          id: "3-4",
          title: "Bài test chương 3",
          type: "test",
          duration: "45 phút",
          completed: false,
          questions: 12
        }
      ]
    },
    {
      id: 4,
      title: "HTML5 và Đa Phương Tiện",
      description: "Tính năng mới trong HTML5 và xử lý đa phương tiện",
      lessons: [
        {
          id: "4-1",
          title: "Giới thiệu HTML5",
          type: "lesson",
          duration: "15 phút",
          completed: false
        },
        {
          id: "4-2",
          title: "Audio và Video",
          type: "lesson",
          duration: "25 phút",
          completed: false
        },
        {
          id: "4-3",
          title: "Canvas và SVG",
          type: "lesson",
          duration: "30 phút",
          completed: false
        },
        {
          id: "4-4",
          title: "Bài test chương 4",
          type: "test",
          duration: "60 phút",
          completed: false,
          questions: 20
        }
      ]
    }
  ]
};

// Tính toán tiến độ khóa học
const calculateProgress = (chapters: any[]) => {
  let completedLessons = 0;
  let totalLessons = 0;
  
  chapters.forEach(chapter => {
    chapter.lessons.forEach((lesson: any) => {
      if (lesson.type === 'lesson') {
        totalLessons++;
        if (lesson.completed) completedLessons++;
      }
    });
  });
  
  return Math.round((completedLessons / totalLessons) * 100);
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Trong thực tế, sẽ fetch dữ liệu từ API
    setLoading(true);
    
    // Giả lập API call
    setTimeout(() => {
      setCourse(courseData);
      setProgress(calculateProgress(courseData.chapters));
      setLoading(false);
    }, 500);
  }, [courseId]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h2>
            <Button asChild>
              <Link to="/courses">Trở về trang khóa học</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Xác định bài học tiếp theo để học
  const getNextLesson = () => {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.type === 'lesson' && !lesson.completed) {
          return { chapter: chapter.id, lesson: lesson.id };
        }
      }
    }
    // Nếu đã hoàn thành tất cả bài học
    return { chapter: course.chapters[0].id, lesson: course.chapters[0].lessons[0].id };
  };
  
  const nextLesson = getNextLesson();
  
  // Xác định màu dựa trên loại bài học
  const getLessonTypeColor = (type: string, completed: boolean) => {
    if (completed) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    if (type === 'test') return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
  };
  
  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) return <Check className="h-4 w-4" />;
    if (type === 'test') return <FileText className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header with course info */}
        <div className="w-full py-16 relative overflow-hidden">
          {/* Background gradient */}
          <div 
            className="absolute inset-0 -z-10" 
            style={{ 
              background: course.color,
              opacity: 0.9 
            }}
          ></div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 -z-5 opacity-20">
            <div className="absolute right-[10%] top-1/4 w-40 h-40 rounded-full bg-white/20 blur-xl"></div>
            <div className="absolute left-[5%] bottom-1/4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Code className="h-10 w-10" />
              </div>
              
              <div className="flex-grow">
                <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
                <p className="mt-2 text-white/80 max-w-3xl">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                      {course.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                      {course.duration}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                      {course.totalLessons} bài học
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                      {course.totalTests} bài kiểm tra
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="md:w-48 w-full mt-4 md:mt-0">
                <Button 
                  size="lg" 
                  className="w-full bg-white hover:bg-white/90 text-blue-600"
                  onClick={() => navigate(`/course/${courseId}/chapter/${nextLesson.chapter}/lesson/${nextLesson.lesson}`)}
                >
                  {progress > 0 ? "Tiếp Tục Học" : "Bắt Đầu Học"}
                </Button>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiến độ</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course content */}
        <div className="container mx-auto px-4 py-10">
          <Tabs defaultValue="content">
            <TabsList className="mb-8">
              <TabsTrigger value="content">Nội Dung Khóa Học</TabsTrigger>
              <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-6">Chương Trình Học</h2>
                  
                  <div className="space-y-6">
                    {course.chapters.map((chapter: any) => (
                      <div key={chapter.id} className="chapter-card">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Chương {chapter.id}: {chapter.title}</h3>
                          <Badge variant="outline">
                            {chapter.lessons.length} bài học
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{chapter.description}</p>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-1">
                          {chapter.lessons.map((lesson: any) => (
                            <Button 
                              key={lesson.id} 
                              variant="ghost" 
                              className="w-full justify-start text-left h-auto py-3"
                              onClick={() => navigate(`/course/${courseId}/chapter/${chapter.id}/lesson/${lesson.id}`)}
                            >
                              <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${getLessonTypeColor(lesson.type, lesson.completed)}`}>
                                {getLessonIcon(lesson.type, lesson.completed)}
                              </div>
                              <div className="flex-grow">
                                <div className="font-medium">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center mt-1">
                                  {lesson.type === 'lesson' ? (
                                    <BookOpen className="h-3 w-3 mr-1" />
                                  ) : (
                                    <FileText className="h-3 w-3 mr-1" />
                                  )}
                                  {lesson.type === 'lesson' ? 'Bài học' : 'Bài kiểm tra'} • {lesson.duration}
                                  {lesson.type === 'test' && ` • ${lesson.questions} câu hỏi`}
                                </div>
                              </div>
                              {lesson.completed ? (
                                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                                  Hoàn thành
                                </Badge>
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 sticky top-24">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                      Sẽ học được gì?
                    </h3>
                    
                    <ul className="space-y-3">
                      {course.objectives.map((objective: string, index: number) => (
                        <li key={index} className="flex">
                          <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-lg font-medium mb-4">Yêu cầu</h3>
                    
                    <ul className="space-y-3">
                      {course.requirements.map((requirement: string, index: number) => (
                        <li key={index} className="flex">
                          <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="overview">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold mb-4">Giới Thiệu Về Khóa Học</h2>
                <p className="text-muted-foreground mb-6">{course.fullDescription}</p>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Ai nên học khóa học này?</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Người mới bắt đầu học lập trình</h4>
                      <p className="text-muted-foreground">Nếu bạn chưa có kinh nghiệm lập trình, HTML là điểm bắt đầu lý tưởng cho hành trình học code của bạn.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Người muốn xây dựng trang web</h4>
                      <p className="text-muted-foreground">Bạn sẽ học cách tạo nền tảng cho trang web của mình với HTML trước khi chuyển sang CSS và JavaScript.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Người học chuyển ngành</h4>
                      <p className="text-muted-foreground">Nếu bạn đang chuyển đổi sang lĩnh vực phát triển web, đây là khóa học cơ bản bạn cần phải nắm vững.</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
