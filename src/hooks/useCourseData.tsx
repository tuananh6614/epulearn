
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Course, Lesson, Chapter } from '@/models/lesson';
import { useAuth } from '@/context/AuthContext';

// Function to generate a random color
const getRandomColor = () => {
  const colors = ['#4F46E5', '#10B981', '#3B82F6', '#D946EF', '#F59E0B'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Mock course data
const mockCourseData: Course = {
  id: '1',
  title: 'Introduction to Web Development',
  description: 'Learn the basics of web development with HTML, CSS and JavaScript',
  thumbnail_url: '/placeholder.jpg',
  image: '/placeholder.jpg',
  category: 'Development',
  duration: '24 hours',
  level: 'Beginner',
  is_premium: false,
  isPremium: false,
  is_featured: true,
  isFeatured: true,
  instructor: 'John Doe',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'published',
  price: '',
  discount_price: '',
  discountPrice: '',
  color: getRandomColor(),
  full_description: 'This comprehensive course covers all the fundamentals of web development, starting with HTML structure, CSS styling, and JavaScript interactivity. You\'ll build several projects throughout the course to reinforce your learning.',
  objectives: [
    'Understand HTML5 document structure and semantics',
    'Create responsive layouts with CSS',
    'Implement interactivity with JavaScript',
    'Build a complete website from scratch'
  ],
  requirements: [
    'No previous coding experience required',
    'Basic computer skills',
    'A computer with internet access'
  ],
  chapters: []
};

// Mock chapters and lessons
const mockChapters: Chapter[] = [
  {
    id: '1',
    title: 'Introduction to HTML',
    description: 'Learn the basics of HTML markup',
    order_index: 1,
    course_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lessons: [
      {
        id: '1',
        title: 'HTML Document Structure',
        content: '<h1>HTML Document Structure</h1><p>In this lesson, we\'ll explore the basic structure of an HTML document including doctype, html, head, and body elements.</p>',
        type: 'text',
        duration: '15 minutes',
        order_index: 1,
        chapter_id: '1',
        course_id: '1',
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'HTML Elements and Tags',
        content: '<h1>HTML Elements and Tags</h1><p>This lesson covers the most commonly used HTML elements and tags for structuring content.</p>',
        type: 'text',
        duration: '20 minutes',
        order_index: 2,
        chapter_id: '1',
        course_id: '1',
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    title: 'CSS Styling Basics',
    description: 'Learn how to style HTML with CSS',
    order_index: 2,
    course_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lessons: [
      {
        id: '3',
        title: 'CSS Selectors',
        content: '<h1>CSS Selectors</h1><p>Learn how to select and target HTML elements with various CSS selector types.</p>',
        type: 'text',
        duration: '25 minutes',
        order_index: 1,
        chapter_id: '2',
        course_id: '1',
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'CSS Box Model',
        content: '<h1>CSS Box Model</h1><p>Understand the CSS box model including margin, border, padding, and content.</p>',
        type: 'text',
        duration: '20 minutes',
        order_index: 2,
        chapter_id: '2',
        course_id: '1',
        is_premium: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
];

// Mock lessons extracted from chapters for flat access
const mockLessons: Lesson[] = mockChapters.reduce((acc: Lesson[], chapter) => {
  return [...acc, ...chapter.lessons!];
}, []);

export interface UseCourseDataProps {
  courseId?: string | number;
}

export const useCourseData = ({ courseId }: UseCourseDataProps) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userProgress, setUserProgress] = useState(0);
  const { user } = useAuth();

  // Fetch course data
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Retrieve mock course data
        if (courseId === '1') {
          setCourse(mockCourseData);
          
          // Simulate user enrollment check
          if (user) {
            setIsEnrolled(true);
            setUserProgress(45); // Mock progress percentage
          }
        } else {
          // For other course IDs, generate a different mock course
          const mockCourse: Course = {
            id: String(courseId),
            title: `Course ${courseId}`,
            description: `This is a mock course with ID ${courseId}`,
            thumbnail_url: '/placeholder.jpg',
            image: '/placeholder.jpg',
            category: 'Development',
            duration: '20 hours',
            level: 'Intermediate',
            is_premium: false,
            isPremium: false,
            is_featured: false,
            isFeatured: false,
            instructor: 'Mock Instructor',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'published',
            price: '',
            discount_price: '',
            discountPrice: '',
            color: getRandomColor(),
            chapters: []
          };
          
          setCourse(mockCourse);
          
          if (user) {
            setIsEnrolled(Math.random() > 0.5); // Randomly determine enrollment
            setUserProgress(Math.floor(Math.random() * 100)); // Random progress
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        toast.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  // Fetch lessons
  useEffect(() => {
    if (!courseId) {
      return;
    }

    const fetchLessons = async () => {
      try {
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        if (courseId === '1') {
          setLessons(mockLessons);
        } else {
          // Generate mock lessons for other course IDs
          const generatedLessons: Lesson[] = [];
          
          for (let i = 1; i <= 4; i++) {
            generatedLessons.push({
              id: `${courseId}-${i}`,
              title: `Lesson ${i} for Course ${courseId}`,
              content: `<h1>Lesson ${i}</h1><p>This is the content for lesson ${i} of course ${courseId}.</p>`,
              type: 'text',
              duration: '15 minutes',
              order_index: i,
              chapter_id: `${courseId}-chapter-1`,
              course_id: String(courseId),
              is_premium: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          
          setLessons(generatedLessons);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
        toast.error('Không thể tải danh sách bài học');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]);

  // Function to update course progress
  const updateProgress = async (lessonId: string | number, completed: boolean) => {
    try {
      if (!user || !courseId) {
        return false;
      }
      
      // Simulate progress update
      console.log(`Updating progress for lesson ${lessonId}, completed: ${completed}`);
      
      // Update local progress state
      if (completed) {
        const newProgress = Math.min(userProgress + 10, 100);
        setUserProgress(newProgress);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  };
  
  // Function to enroll in course
  const enrollInCourse = async () => {
    try {
      if (!user || !courseId) {
        toast.error('Bạn cần đăng nhập để đăng ký khóa học');
        return;
      }
      
      // Simulate enrollment delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsEnrolled(true);
      setUserProgress(0);
      
      toast.success('Đăng ký khóa học thành công');
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast.error('Không thể đăng ký khóa học');
    }
  };

  return {
    course,
    lessons,
    loading,
    error,
    updateProgress,
    isEnrolled,
    enrollInCourse,
    userProgress,
    courseData: course // alias for backward compatibility
  };
};

export default useCourseData;
