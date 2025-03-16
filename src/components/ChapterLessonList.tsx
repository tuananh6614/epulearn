import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, BookOpen, FileText, PlayCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';

// Định nghĩa các giao diện
interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: string;
  is_premium: boolean;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonProgress {
  completed: boolean;
}

interface ChapterLessonListProps {
  courseId: string;
  chapters: Chapter[];
  lessonProgress: Record<string, LessonProgress>;
  isEnrolled: boolean;
}

const ChapterLessonList = ({ courseId, chapters, lessonProgress, isEnrolled }: ChapterLessonListProps) => {
  const navigate = useNavigate();
  
  const getChapterProgress = (chapter: Chapter) => {
    const chapterLessons = chapter.lessons || [];
    const completedLessons = chapterLessons.filter(
      (lesson) => lessonProgress[lesson.id]?.completed
    ).length;
    const totalLessons = chapterLessons.length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };
  
  const handleLessonClick = (chapterId: string, lessonId: string) => {
    if (isEnrolled) {
      navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lessonId}`);
    }
  };
  
  return (
    <div className="space-y-6">
      {chapters.map((chapter) => {
        const progressPercentage = getChapterProgress(chapter);
        
        return (
          <div key={chapter.id} className="border rounded-lg overflow-hidden">
            <div 
              className="bg-gray-50 dark:bg-gray-800 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => navigate(`/course/${courseId}/chapter/${chapter.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium flex items-center">
                  <BookOpen className="h-4 w-4 text-primary mr-2" />
                  {chapter.title}
                </h3>
                <Badge variant={progressPercentage === 100 ? "secondary" : "outline"} className={progressPercentage === 100 ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                  {progressPercentage === 100 ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : null}
                  {progressPercentage}%
                </Badge>
              </div>
              
              <Progress value={progressPercentage} className="h-1 mb-2" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{chapter.lessons?.length || 0} bài học</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto font-normal hover:bg-transparent hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/course/${courseId}/chapter/${chapter.id}`);
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
            
            <Accordion type="single" collapsible>
              <AccordionItem value="lessons">
                <AccordionTrigger className="px-4 py-2 text-sm font-medium">
                  Danh sách bài học
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="divide-y">
                    {chapter.lessons?.map((lesson) => {
                      const isCompleted = lessonProgress[lesson.id]?.completed || false;
                      
                      return (
                        <li 
                          key={lesson.id}
                          className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                            isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''
                          }`}
                          onClick={() => handleLessonClick(chapter.id, lesson.id)}
                        >
                          <div className="flex items-center">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : lesson.type === 'video' ? (
                              <PlayCircle className="h-4 w-4 text-primary mr-2" />
                            ) : lesson.type === 'test' ? (
                              <FileText className="h-4 w-4 text-orange-500 mr-2" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                            )}
                            <span>{lesson.title}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">{lesson.duration}</span>
                            {!isEnrolled && lesson.is_premium && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </li>
                      );
                    })}
                    
                    {/* Chapter test */}
                    <li 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-orange-50 dark:bg-orange-900/10"
                      onClick={() => isEnrolled && navigate(`/course/${courseId}/chapter/${chapter.id}/test`)}
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-orange-500 mr-2" />
                        <span className="font-medium">Bài kiểm tra chương</span>
                      </div>
                      
                      <span className="text-xs text-muted-foreground">15 câu hỏi</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );
      })}
    </div>
  );
};

export default ChapterLessonList;