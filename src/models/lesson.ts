
// Lesson data structures for our application

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'lesson' | 'test' | 'video';
  duration: string;
  chapterId: string;
  courseId: string;
  orderIndex: number;
  isPremium: boolean;
  completed?: boolean;
  current?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  level: string;
  duration: string;
  category: string;
  image: string;
  color: string;
  isPremium?: boolean;
  price?: number;
  discountPrice?: number;
  isFeatured?: boolean;
  instructor?: string;
  chapters: Chapter[];
  requirements?: string[];
  objectives?: string[];
}

export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface LessonData {
  id: string;
  title: string;
  content: string;
  course: string;
  courseId: string;
  duration: string;
  description: string;
  isPremium?: boolean;
  courseStructure: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: string;
      completed: boolean;
      current?: boolean;
      isPremium?: boolean;
    }[];
  }[];
  quiz?: Quiz[];
  videoUrl?: string;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastPosition?: string;
  completedAt?: string;
}

export interface UserCertificate {
  id: string;
  userId: string;
  courseId: string;
  certificateId: string;
  issueDate: string;
  courseName: string;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  image: string;
  color: string;
  isPremium?: boolean;
  price?: number;
  discountPrice?: number;
  level?: string;
  duration?: string;
  category?: string;
}

export interface SupabaseCourseResponse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  price: number | null;
  discount_price: number | null;
  is_premium: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  chapters?: SupabaseChapterResponse[];
}

export interface SupabaseChapterResponse {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: SupabaseLessonResponse[];
}

export interface SupabaseLessonResponse {
  id: string;
  chapter_id: string;
  course_id: string;
  title: string;
  content: string;
  type: 'lesson' | 'video' | 'test';
  duration: string;
  order_index: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentDetails {
  paymentId: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  date: string;
}
