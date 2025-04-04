
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Course {
  id: number | string;
  title: string;
  description: string;
  duration: string;
  image: string;
  level: string;
  instructor: string;
  category: string;
  full_description?: string;
  requirements?: string[];
  objectives?: string[];
  is_premium?: boolean;
  chapters: Chapter[];
}

interface Chapter {
  id: number | string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number | string;
  title: string;
  duration?: string;
  type?: string;
  is_premium?: boolean;
}

interface UseCourseDataParams {
  courseId?: number | string;
}

interface UseCourseDataResult {
  course: Course | null;
  isEnrolled: boolean;
  loading: boolean;
  error: Error | null;
  userProgress: number;
  enrollInCourse: () => Promise<void>;
}

// Mock data
const mockCourses: Record<string, Course> = {
  '1': {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Learn the core concepts of JavaScript programming",
    duration: "10 hours",
    image: "/images/courses/javascript.jpg",
    level: "Beginner",
    instructor: "John Doe",
    category: "Programming",
    full_description: "A comprehensive course on JavaScript fundamentals covering all the basics and advanced topics.",
    requirements: ["Basic computer skills", "Understanding of HTML and CSS"],
    objectives: ["Understand JavaScript syntax", "Create interactive web pages", "Build basic web applications"],
    is_premium: false,
    chapters: [
      {
        id: 1,
        title: "Introduction to JavaScript",
        lessons: [
          { id: 1, title: "What is JavaScript?", duration: "10 min", type: "video", is_premium: false },
          { id: 2, title: "Setting up your environment", duration: "15 min", type: "text", is_premium: false },
          { id: 3, title: "Hello World", duration: "5 min", type: "code", is_premium: false }
        ]
      },
      {
        id: 2,
        title: "JavaScript Basics",
        lessons: [
          { id: 4, title: "Variables and Data Types", duration: "20 min", type: "video", is_premium: false },
          { id: 5, title: "Operators", duration: "15 min", type: "text", is_premium: false },
          { id: 6, title: "Control Flow", duration: "25 min", type: "code", is_premium: false },
          { id: 7, title: "Chapter Quiz", duration: "10 min", type: "test", is_premium: true }
        ]
      }
    ]
  },
  '2': {
    id: 2,
    title: "React for Beginners",
    description: "Learn React from scratch",
    duration: "15 hours",
    image: "/images/courses/react.jpg",
    level: "Intermediate",
    instructor: "Jane Smith",
    category: "Frontend Development",
    full_description: "Master React, the popular JavaScript library for building user interfaces.",
    requirements: ["JavaScript knowledge", "Basic HTML and CSS"],
    objectives: ["Understand React components", "State management with hooks", "Build complete React applications"],
    is_premium: true,
    chapters: [
      {
        id: 3,
        title: "Introduction to React",
        lessons: [
          { id: 8, title: "What is React?", duration: "10 min", type: "video", is_premium: false },
          { id: 9, title: "Setting up a React project", duration: "20 min", type: "text", is_premium: true }
        ]
      },
      {
        id: 4,
        title: "React Components",
        lessons: [
          { id: 10, title: "Functional Components", duration: "15 min", type: "video", is_premium: true },
          { id: 11, title: "Class Components", duration: "20 min", type: "text", is_premium: true },
          { id: 12, title: "Props and State", duration: "25 min", type: "code", is_premium: true },
          { id: 13, title: "Component Quiz", duration: "10 min", type: "test", is_premium: true }
        ]
      }
    ]
  }
};

// Mock enrollment data
const mockEnrollments: Record<string, string[]> = {
  'demo-user-1': ['1', '2']
};

export const useCourseData = ({ courseId }: UseCourseDataParams): UseCourseDataResult => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userProgress, setUserProgress] = useState<number>(0);
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        if (!courseId) {
          setError(new Error('No course ID provided'));
          return;
        }
        
        // Get course from mock data
        const courseData = mockCourses[courseId.toString()];
        
        if (!courseData) {
          setError(new Error('Course not found'));
          return;
        }
        
        setCourse(courseData);
        
        // Check if user is enrolled in this course
        if (user && user.id) {
          const userEnrollments = mockEnrollments[user.id] || [];
          setIsEnrolled(userEnrollments.includes(courseId.toString()));
          
          // Generate a random progress percentage
          setUserProgress(Math.floor(Math.random() * 100));
        } else {
          setIsEnrolled(false);
        }
        
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, user]);
  
  const enrollInCourse = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        toast.error("Bạn cần đăng nhập để đăng ký khóa học");
        return;
      }
      
      if (!courseId) {
        toast.error("Không tìm thấy thông tin khóa học");
        return;
      }
      
      // Simulate enrollment API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update mock enrollment data
      if (user.id) {
        if (!mockEnrollments[user.id]) {
          mockEnrollments[user.id] = [];
        }
        
        if (!mockEnrollments[user.id].includes(courseId.toString())) {
          mockEnrollments[user.id].push(courseId.toString());
        }
        
        setIsEnrolled(true);
        toast.success("Đăng ký khóa học thành công");
      }
      
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast.error("Có lỗi xảy ra khi đăng ký khóa học");
    } finally {
      setLoading(false);
    }
  };
  
  return {
    course,
    isEnrolled,
    loading,
    error,
    userProgress,
    enrollInCourse
  };
};
