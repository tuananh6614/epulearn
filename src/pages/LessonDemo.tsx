import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { LessonData } from '@/models/lesson';

const LessonDemo = () => {
  const lessonData: LessonData = {
    id: "demo-123",
    title: "Giới thiệu về JavaScript",
    content: "# JavaScript Cơ bản\n\nJavaScript là ngôn ngữ lập trình phổ biến nhất trên thế giới...",
    type: "video", // Add missing required property
    chapterId: "chapter-1", // Add missing required property
    courseId: "course-123",
    duration: "15 phút",
    description: "Bài học giới thiệu về JavaScript, ngôn ngữ lập trình phổ biến nhất thế giới.",
    courseStructure: [
      {
        id: "chapter-1",
        title: "Nhập môn JavaScript",
        lessons: [
          {
            id: "demo-123",
            title: "Giới thiệu về JavaScript",
            type: "video",
            completed: false,
            current: true
          },
          {
            id: "lesson-2",
            title: "Biến và kiểu dữ liệu",
            type: "text",
            completed: false,
            current: false
          }
        ]
      }
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  };

  useEffect(() => {
    console.log("Lesson loaded:", lessonData.title);
  }, [lessonData]);
  
  useEffect(() => {
    // Example fix:
    console.log("Course ID:", lessonData.courseId);
    // NOT lessonData.course
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Breadcrumbs
        items={[
          { label: 'Khóa học', link: '/courses' },
          { label: 'Nhập môn JavaScript', link: `/course/${lessonData.courseId}` },
          { label: lessonData.title },
        ]}
        className="mb-4"
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{lessonData.title}</h1>
        <p className="text-gray-600">{lessonData.description}</p>
      </div>

      <div className="mb-8">
        {lessonData.type === 'video' ? (
          <iframe
            width="100%"
            height="400"
            src={lessonData.videoUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lessonData.content }} />
        )}
      </div>

      <div className="flex justify-between items-center">
        <Button asChild variant="outline">
          <Link to={`/course/${lessonData.courseId}`} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại khóa học
          </Link>
        </Button>
        <div>
          {lessonData.courseStructure && lessonData.courseStructure.length > 0 && (
            <select className="border p-2 rounded">
              {lessonData.courseStructure.map(chapter => (
                <optgroup key={chapter.id} label={chapter.title}>
                  {chapter.lessons && chapter.lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title} {lesson.current ? '(Hiện tại)' : ''} {lesson.completed ? '(Đã hoàn thành)' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDemo;
