import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Course {
  id: number | string;
  title: string;
  description: string;
  duration: string;
  chapters: Chapter[];
  // ... other course properties
}

interface Chapter {
  id: number | string;
  title: string;
  lessons: Lesson[];
  // ... other chapter properties
}

interface Lesson {
  id: number | string;
  title: string;
  duration?: string;
  type?: string;
  // ... other lesson properties
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
}

// Mock data
const mockCourses: Record<string, Course> = {
  '1': {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Learn the core concepts of JavaScript programming",
    duration: "10 hours",
    chapters: [
      {
        id: 1,
        title: "Introduction to JavaScript",
        lessons: [
          { id: 1, title: "What is JavaScript?", duration: "10 min", type: "video" },
          { id: 2, title: "Setting up your environment", duration: "15 min", type: "text" },
          { id: 3, title: "Hello World", duration: "5 min", type: "code" }
        ]
      },
      {
        id: 2,
        title: "JavaScript Basics",
        lessons: [
          { id: 4, title: "Variables and Data Types", duration: "20 min", type: "video" },
          { id: 5, title: "Operators", duration: "15 min", type: "text" },
          { id: 6, title: "Control Flow", duration: "25 min", type: "code" },
          { id: 7, title: "Chapter Quiz", duration: "10 min", type: "test" }
        ]
      }
    ]
  },
  '2': {
    id: 2,
    title: "React for Beginners",
    description: "Learn React from scratch",
    duration: "15 hours",
    chapters: [
      {
        id: 3,
        title: "Introduction to React",
        lessons: [
          { id: 8, title: "What is React?", duration: "10 min", type: "video" },
          { id: 9, title: "Setting up a React project", duration: "20 min", type: "text" }
        ]
      },
      {
        id: 4,
        title: "React Components",
        lessons: [
          { id: 10, title: "Functional Components", duration: "15 min", type: "video" },
          { id: 11, title: "Class Components", duration: "20 min", type: "text" },
          { id: 12, title: "Props and State", duration: "25 min", type: "code" },
          { id: 13, title: "Component Quiz", duration: "10 min", type: "test" }
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
  
  return {
    course,
    isEnrolled,
    loading,
    error,
    userProgress
  };
};
