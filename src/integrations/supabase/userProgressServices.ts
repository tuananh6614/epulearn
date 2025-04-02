
/**
 * Mock User Progress Services
 * 
 * Cung cấp các chức năng theo dõi tiến độ học tập giả lập cho ứng dụng
 */
import { LessonProgress, CourseProgress } from '@/models/lesson';

// Mock data for progress
const mockLessonProgress: Record<string, LessonProgress> = {};
const mockCourseProgress: Record<string, Record<string, CourseProgress>> = {};

// Hàm giả lập cập nhật tiến độ bài học
export const updateLessonProgress = async (
  userId: string,
  courseId: string | number,
  chapterId: string | number,
  lessonId: string | number,
  completed: boolean = false,
  currentPageId?: string | number
): Promise<boolean> => {
  console.log(`[MOCK] Updating lesson progress - User: ${userId}, Course: ${courseId}, Chapter: ${chapterId}, Lesson: ${lessonId}, Completed: ${completed}`);
  
  const progressKey = `${userId}-${courseId}-${chapterId}-${lessonId}`;
  
  mockLessonProgress[progressKey] = {
    id: `progress-${Date.now()}`,
    user_id: userId,
    course_id: courseId,
    chapter_id: chapterId,
    lesson_id: lessonId,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    last_position: null,
    updated_at: new Date().toISOString(),
    created_at: mockLessonProgress[progressKey]?.created_at || new Date().toISOString(),
    current_page_id: currentPageId
  };
  
  // Cập nhật tiến độ khóa học
  updateCourseProgress(userId, String(courseId));
  
  return true;
};

// Hàm giả lập lấy tiến độ bài học
export const getLessonProgress = async (
  userId: string,
  courseId: string | number,
  chapterId: string | number,
  lessonId: string | number
): Promise<LessonProgress | null> => {
  console.log(`[MOCK] Getting lesson progress - User: ${userId}, Course: ${courseId}, Chapter: ${chapterId}, Lesson: ${lessonId}`);
  
  const progressKey = `${userId}-${courseId}-${chapterId}-${lessonId}`;
  return mockLessonProgress[progressKey] || null;
};

// Hàm giả lập cập nhật tiến độ khóa học
export const updateCourseProgress = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  console.log(`[MOCK] Updating course progress - User: ${userId}, Course: ${courseId}`);
  
  if (!mockCourseProgress[userId]) {
    mockCourseProgress[userId] = {};
  }
  
  // Tính tiến độ khóa học dựa trên số bài học đã hoàn thành
  const totalLessons = 10; // Giả sử có 10 bài học
  let completedLessons = 0;
  
  // Đếm số bài học đã hoàn thành trong khóa học này
  Object.keys(mockLessonProgress).forEach(key => {
    if (key.includes(`${userId}-${courseId}`) && mockLessonProgress[key].completed) {
      completedLessons++;
    }
  });
  
  // Cập nhật tiến độ
  mockCourseProgress[userId][courseId] = {
    progress_percentage: Math.min(Math.round((completedLessons / totalLessons) * 100), 100),
    last_accessed: new Date().toISOString()
  };
  
  return true;
};

// Hàm giả lập lấy tiến độ khóa học
export const getCourseProgress = async (
  userId: string,
  courseId: string
): Promise<CourseProgress | null> => {
  console.log(`[MOCK] Getting course progress - User: ${userId}, Course: ${courseId}`);
  
  if (!mockCourseProgress[userId] || !mockCourseProgress[userId][courseId]) {
    return {
      progress_percentage: 0,
      last_accessed: null
    };
  }
  
  return mockCourseProgress[userId][courseId];
};

// Hàm giả lập lấy tất cả tiến độ bài học trong khóa học
export const getAllLessonProgressForCourse = async (
  userId: string,
  courseId: string | number
): Promise<LessonProgress[]> => {
  console.log(`[MOCK] Getting all lesson progress for course - User: ${userId}, Course: ${courseId}`);
  
  const progressList: LessonProgress[] = [];
  
  Object.keys(mockLessonProgress).forEach(key => {
    if (key.includes(`${userId}-${courseId}`)) {
      progressList.push(mockLessonProgress[key]);
    }
  });
  
  return progressList;
};

// Add missing functions
export const saveLessonProgress = async (
  userId: string,
  courseId: string | number,
  chapterId: string | number,
  lessonId: string | number,
  completed: boolean = false
): Promise<boolean> => {
  return updateLessonProgress(userId, courseId, chapterId, lessonId, completed);
};

export const getLessonPages = async (lessonId: string | number): Promise<any[]> => {
  console.log(`[MOCK] Getting pages for lesson ID: ${lessonId}`);
  return [
    {
      id: 1,
      lesson_id: lessonId,
      content: "<h1>Nội dung bài học</h1><p>Đây là nội dung của trang 1</p>",
      order_index: 1
    },
    {
      id: 2,
      lesson_id: lessonId,
      content: "<h1>Tiếp tục</h1><p>Đây là nội dung của trang 2</p>",
      order_index: 2
    }
  ];
};

export default {
  updateLessonProgress,
  getLessonProgress,
  updateCourseProgress,
  getCourseProgress,
  getAllLessonProgressForCourse,
  saveLessonProgress,
  getLessonPages
};
