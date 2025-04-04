
export interface TestQuestion {
  id: string | number;
  question: string;
  options: string[];
  correct_answer: number;
  points?: number;
}

export interface CourseTest {
  id: string | number;
  title: string;
  description: string;
  passing_score: number;
  time_limit: number;
  course_id: string | number;
  created_at: string;
  updated_at: string;
  questions: TestQuestion[];
}

export interface TestResult {
  id?: string | number;
  user_id: string;
  course_id: string | number;
  course_test_id?: string | number;
  chapter_id?: string | number;
  score: number;
  passed: boolean;
  time_taken?: number;
  answers?: Record<string, number>;
  created_at?: string;
}

export interface Lesson {
  id: string | number;
  title: string;
  content?: string;
  chapter_id: string | number;
  course_id: string | number;
  order_index: number;
  duration: string;
  created_at: string;
  updated_at: string;
  type: 'text' | 'video' | 'quiz' | 'test';
  chapterTitle?: string;
  nextLesson?: Lesson | null;
  prevLesson?: Lesson | null;
  is_premium?: boolean;
  isPremium?: boolean;
}

export interface LessonPage {
  id: string | number;
  lesson_id: string | number;
  title: string;
  content: string;
  order_index: number;
}

// Additional types needed
export interface Page {
  id: string | number;
  lesson_id: string | number;
  content: string;
  order_index: number;
  title?: string;
}

export interface Chapter {
  id: string | number;
  title: string;
  description?: string;
  course_id: string | number;
  order_index: number;
}

export interface Course {
  id: string | number;
  title: string;
  description: string;
  full_description?: string;
  thumbnail_url?: string;
  image?: string;
  category?: string;
  duration?: string;
  level?: string;
  is_premium?: boolean;
  isPremium?: boolean;
  is_featured?: boolean;
  isFeatured?: boolean;
  instructor?: string;
  created_at: string;
  updated_at: string;
  status?: string;
  price?: string;
  discount_price?: string;
  discountPrice?: string;
  color?: string;
  chapters?: Chapter[];
  objectives?: string[];
  requirements?: string[];
}

export interface LessonData {
  id: string | number;
  title: string;
  content: string;
  duration: string;
  type: string;
}

export interface EnrolledCourse extends Course {
  progress?: number;
  lastAccessed?: string;
  enrolledDate?: string;
}
