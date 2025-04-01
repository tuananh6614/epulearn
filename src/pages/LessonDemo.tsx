import React from 'react';
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LessonData } from '@/models/lesson';

const lessonContent = `
  <h1>Chào mừng đến với JavaScript!</h1>
  <p>JavaScript là một ngôn ngữ lập trình mạnh mẽ, được sử dụng rộng rãi để phát triển các ứng dụng web động và tương tác.</p>
  <h2>Tại sao nên học JavaScript?</h2>
  <ul>
    <li><strong>Tính phổ biến:</strong> JavaScript chạy trên mọi trình duyệt và được hỗ trợ bởi cộng đồng lớn mạnh.</li>
    <li><strong>Tính linh hoạt:</strong> JavaScript có thể được sử dụng để phát triển cả frontend và backend (với Node.js).</li>
    <li><strong>Cơ hội nghề nghiệp:</strong> Nhu cầu tuyển dụng lập trình viên JavaScript luôn ở mức cao.</li>
  </ul>
  <h2>Bắt đầu thôi!</h2>
  <p>Trong bài học này, chúng ta sẽ cùng nhau khám phá những khái niệm cơ bản nhất của JavaScript. Hãy cùng nhau bắt đầu hành trình thú vị này!</p>
`;

// In the component where you're using LessonData
const demoLesson: LessonData = {
  id: "demo-lesson",
  title: "Giới thiệu về JavaScript",
  content: lessonContent,
  type: "text", // Add missing required property
  chapterId: "demo-chapter", // Add missing required property
  courseId: "demo-course",
  duration: "10 phút",
  description: "Bài học giới thiệu JavaScript cơ bản",
  courseStructure: [
    {
      id: "chapter-1",
      title: "Giới thiệu",
      lessons: [
        {
          id: "lesson-1",
          title: "Giới thiệu về JavaScript",
          type: "text",
          completed: false,
          current: true
        },
        {
          id: "lesson-2",
          title: "Cài đặt môi trường",
          type: "video",
          completed: false,
          current: false
        }
      ]
    }
  ],
  videoUrl: "https://example.com/lesson-video.mp4"
};

const LessonDemo = () => {
    const lesson = demoLesson;

    // Replace any references to lesson.course with lesson.courseId
    const breadcrumbs = [
        { label: "Tất cả khóa học", href: "/courses" },
        { label: "Khóa học JavaScript", href: `/course/${lesson.courseId}` },
        { label: "Giới thiệu", href: `/course/${lesson.courseId}/chapter/1` },
        { label: lesson.title, href: "#" }
    ];

    return (
        <div className="container mx-auto py-8">
            <Breadcrumbs items={breadcrumbs} />

            <Card className="mb-8">
                <CardContent>
                    <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardContent>
                    <h2 className="text-xl font-bold mb-4">Cấu trúc khóa học</h2>
                    <Accordion type="single" collapsible>
                        {lesson.courseStructure?.map((chapter) => (
                            <AccordionItem key={chapter.id} value={chapter.id}>
                                <AccordionTrigger>{chapter.title}</AccordionTrigger>
                                <AccordionContent>
                                    <ul>
                                        {chapter.lessons.map((lessonItem) => (
                                            <li key={lessonItem.id} className="flex items-center justify-between">
                                                {lessonItem.title}
                                                {lessonItem.current && <span>(Hiện tại)</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <div className="text-right">
                <Button asChild>
                    <Link to={`/course/${lesson.courseId}`} className="flex items-center">
                        Tiếp tục khóa học <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default LessonDemo;
