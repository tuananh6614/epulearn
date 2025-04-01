import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BookOpen, PlayCircle, File, FileQuestion, Play, LockIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useCourseData } from '@/hooks/useCourseData';
import { fetchCourseContent } from '@/integrations/supabase/courseServices';
import { enrollUserInCourse } from '@/integrations/supabase/apiUtils';
import Navbar from '@/components/Navbar';
import { toNumberId } from '@/utils/idConverter';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = toNumberId(courseId);
  const navigate = useNavigate();
  const { user, currentUser } = useAuth();
  
  const { courseData, isEnrolled, loading, error, enrollInCourse } = useCourseData(numericCourseId);
  const course = courseData;
  
  useEffect(() => {
    if (error) {
      toast.error("Không thể tải dữ liệu khóa học");
    }
  }, [error]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy khóa học</CardTitle>
            <CardDescription>
              Khóa học này có thể không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/courses')}>
              Quay lại danh sách khóa học
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleChapterClick = (chapterId: string) => {
    if (isEnrolled) {
      navigate(`/course/${courseId}/chapter/${chapterId}`);
    } else {
      toast.error("Bạn cần đăng ký khóa học trước khi xem chi tiết chương");
    }
  };
  
  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      <div className="container max-w-6xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 ">
            <Card className="bg-white dark:bg-secondary ">
              <CardHeader>
                <CardTitle className="text-2xl font-bold ">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 ">
                <img
                  src={course.image}
                  alt={course.title}
                  className="rounded-md w-full object-cover aspect-video "
                />
                
                <div className="flex items-center space-x-4 ">
                  <Badge variant="secondary">{course.level}</Badge>
                  <span className="text-muted-foreground">{course.duration}</span>
                </div>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="curriculum">Nội dung khóa học</TabsTrigger>
                    <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Mô tả khóa học</h3>
                      <p>{course.fullDescription || course.description}</p>
                      
                      <h3 className="text-xl font-semibold">Yêu cầu</h3>
                      <ul>
                        {(course.requirements || []).map((req, index) => (
                          <li key={index} className="list-disc ml-6">{req}</li>
                        ))}
                      </ul>
                      
                      <h3 className="text-xl font-semibold">Mục tiêu</h3>
                      <ul>
                        {(course.objectives || []).map((obj, index) => (
                          <li key={index} className="list-disc ml-6">{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="curriculum" className="mt-4">
                    {course?.chapters?.map((chapter, index) => (
                      <Accordion
                        key={chapter.id}
                        type="single"
                        collapsible
                        className="mb-4 border rounded-lg "
                      >
                        <AccordionItem value={`chapter-${index}`} className="border-none">
                          <AccordionTrigger
                            className="px-4 py-2 hover:no-underline hover:bg-muted/50 "
                          >
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center">
                                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                                <div className="text-left">
                                  <p className="font-medium">{chapter.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {chapter.lessons?.length || 0} bài học
                                  </p>
                                </div>
                              </div>
                              {isEnrolled && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="ml-auto mr-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChapterClick(chapter.id);
                                  }}
                                >
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Xem chi tiết
                                </Button>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pt-26 pb-3">
                            <ul className="space-y-2">
                              {chapter.lessons?.map((lesson) => (
                                <li
                                  key={lesson.id}
                                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                                >
                                  <div className="flex items-center">
                                    {lesson.type === "video" ? (
                                      <PlayCircle className="h-4 w-4 mr-2 text-primary" />
                                    ) : lesson.type === "test" ? (
                                      <FileQuestion className="h-4 w-4 mr-2 text-primary" />
                                    ) : (
                                      <File className="h-4 w-4 mr-2 text-primary" />
                                    )}
                                    <span className="text-sm">{lesson.title}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-xs text-muted-foreground mr-2">
                                      {lesson.duration}
                                    </span>
                                    {isEnrolled ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() =>
                                          navigate(
                                            `/course/${courseId}/chapter/${chapter.id}/lesson/${lesson.id}`
                                          )
                                        }
                                      >
                                        <Play className="h-3 w-3" />
                                      </Button>
                                    ) : lesson.is_premium ? (
                                      <LockIcon className="h-3 w-3 text-muted-foreground" />
                                    ) : null}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-4">
                    <p>Chưa có tính năng!</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card className="bg-white dark:bg-secondary">
              <CardHeader>
                <CardTitle>Thông tin khóa học</CardTitle>
                <CardDescription>
                  Tổng quan về khóa học và tiến trình của bạn.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Tiến độ khóa học
                  </h3>
                  <Progress value={userProgress} />
                  <p className="text-sm text-muted-foreground">
                    Bạn đã hoàn thành {userProgress}% khóa học.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Giảng viên
                  </h3>
                  <p>{course.instructor}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Thể loại
                  </h3>
                  <p>{course.category}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Thời lượng
                  </h3>
                  <p>{course.duration}</p>
                </div>
                
                {course.is_premium && !currentUser?.isVip && (
                  <Badge variant="destructive">Khóa học VIP</Badge>
                )}
              </CardContent>
              
              <CardContent>
                {!isEnrolled ? 
                (
                  <Button className="w-full" onClick={enrollInCourse} disabled={loading}>
                    {course.is_premium && !currentUser?.isVip ? "Nâng cấp VIP để đăng ký" : "Đăng ký khóa học"}
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => navigate(`/course/${courseId}/start`)}>
                    Tiếp tục học
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
