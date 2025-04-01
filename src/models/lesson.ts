
export interface Lesson {
  id: number;
  title: string;
  content: string;
  duration: string;
  type: string; // video, text, etc.
  order_index: number;
  chapter_id: number;
  course_id: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  title: string;
  description?: string;
  order_index: number;
  course_id: number;
  lessons?: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  duration: string;
  level: string;
  is_premium: boolean;
  is_featured: boolean;
  instructor: string;
  created_at: string;
  updated_at: string;
  status: string;
  price?: string;
  discount_price?: string;
  full_description?: string;
  objectives?: string[];
  requirements?: string[];
  chapters?: Chapter[];
  userCanAccess?: boolean;
  
  // Compatibility properties for older code
  image?: string;
  color?: string;
  isPremium?: boolean;
  discountPrice?: string;
  isFeatured?: boolean;
}

export interface Page {
  id: number;
  lesson_id: number;
  content: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// Progress interfaces
export interface LessonProgress {
  id: number;
  user_id: string; // This stays as string because it references auth.users
  lesson_id: number;
  course_id: number;
  chapter_id: number;
  completed: boolean;
  completed_at: string | null;
  last_position: string | null; // JSON stringified position data
  updated_at: string;
  created_at: string;
  current_page_id?: number;
}

export interface CourseProgress {
  progress_percentage: number;
  last_accessed: string | null;
}

// Test related interfaces
export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  course_test_id?: number;
  chapter_id?: number;
  points?: number;
}

export interface TestResult {
  id: number;
  user_id: string; // This stays as string because it references auth.users
  course_id?: number;
  course_test_id?: number;
  chapter_id?: number;
  score: number;
  passed: boolean;
  time_taken?: number;
  answers?: Record<string, number>;
  created_at?: string;
}

// Certificate interface
export interface Certificate {
  id: number;
  user_id: string; // This stays as string because it references auth.users
  course_id: number;
  certificate_id: string;
  issue_date: string;
  course?: {
    title: string;
  };
}

// Response types for Supabase
export interface SupabaseLessonResponse extends Lesson {}
export interface SupabaseChapterResponse extends Chapter {}

export interface SupabaseCourseResponse extends Course {
  // Add any specific fields from Supabase that don't match the Course interface
}

export interface SupabasePageResponse extends Page {}

export interface SupabaseLessonProgressResponse extends LessonProgress {}
export interface SupabseCourseProgressResponse extends CourseProgress {}

export interface SupabaseTestQuestionResponse extends TestQuestion {}
export interface SupabaseTestResultResponse extends TestResult {}

export interface SupabaseCertificateResponse extends Certificate {}

// Add EnrolledCourse interface that was previously missing
export interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
  progress: number;
  isCompleted: boolean;
  lastAccessed: string;
  enrolledAt: string;
  status: string;
}

// Add LessonData interface that was previously missing
export interface LessonData {
  id: number;
  title: string;
  content: string;
  type: string;
  chapterId: number;
  courseId: number;
}
