import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, BookOpen, Check, Play, FileText, Code, Trophy } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Định nghĩa kiểu cho bài học
interface Lesson {
  id: string;
  title: string;
  type: 'lesson' | 'test';
  duration: string;
  completed: boolean;
  questions?: number; // Chỉ áp dụng cho bài test
}

// Định nghĩa kiểu cho chương học
interface Chapter {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

// Định nghĩa kiểu cho khóa học
interface Course {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  level: string;
  duration: string;
  totalLessons: number;
  totalTests: number;
  image: string;
  color: string;
  requirements: string[];
  objectives: string[];
  chapters: Chapter[];
}

// Hàm tính tiến độ dựa trên danh sách chương và bài học
const calculateProgress = (chapters: Chapter[]): number => {
  let completedLessons = 0;
  let totalLessons = 0;
  
  chapters.forEach(chapter => {
    chapter.lessons.forEach((lesson) => {
      if (lesson.type === 'lesson') {
        totalLessons++;
        if (lesson.completed) completedLessons++;
      }
    });
  });
  
  return totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    setLoading(true);
    
    // Lấy dữ liệu từ API thật (thay URL dưới đây bằng endpoint của bạn)
    fetch(`http://localhost:3000/api/courses/${courseId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu khóa học");
        }
        return response.json();
      })
      .then((data: Course) => {
        setCourse(data);
        setProgress(calculateProgress(data.chapters));
        setLoading(false);
      })
      .catch(error => {
        console.error("Lỗi khi tải dữ liệu:", error);
        setLoading(false);
      });
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
  const getNextLesson = (): { chapter: number; lesson: string } => {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.type === 'lesson' && !lesson.completed) {
          return { chapter: chapter.id, lesson: lesson.id };
        }
      }
    }
    // Nếu đã hoàn thành tất cả bài học, trả về bài học đầu tiên
    return { chapter: course.chapters[0].id, lesson: course.chapters[0].lessons[0].id };
  };
  
  const nextLesson = getNextLesson();
  
  // Xác định màu và icon dựa trên loại bài học
  const getLessonTypeColor = (type: string, completed: boolean): string => {
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
        {/* Header với thông tin khóa học */}
        <div className="w-full py-16 relative overflow-hidden">
          <div 
            className="absolute inset-0 -z-10" 
            style={{ 
              background: course.color,
              opacity: 0.9 
            }}
          ></div>
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
        
        {/* Nội dung khóa học */}
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
                    {course.chapters.map(chapter => (
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
                          {chapter.lessons.map(lesson => (
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
                      {course.objectives.map((objective, index) => (
                        <li key={index} className="flex">
                          <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                    <Separator className="my-6" />
                    <h3 className="text-lg font-medium mb-4">Yêu cầu</h3>
                    <ul className="space-y-3">
                      {course.requirements.map((requirement, index) => (
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
