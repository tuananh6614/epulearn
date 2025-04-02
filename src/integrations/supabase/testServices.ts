
/**
 * Mock Test Services
 * 
 * Cung cấp các chức năng kiểm tra giả lập cho ứng dụng
 */
import { TestQuestion, CourseTest, TestResult } from '@/models/lesson';

// Tạo dữ liệu mẫu cho bài kiểm tra
const mockTestQuestions: TestQuestion[] = [
  {
    id: 1,
    question: "JavaScript là ngôn ngữ lập trình phía nào?",
    options: ["Frontend", "Backend", "Cả hai", "Không có câu trả lời đúng"],
    correct_answer: 2,
    points: 10
  },
  {
    id: 2,
    question: "React là gì?",
    options: ["Thư viện JavaScript", "Framework PHP", "Ngôn ngữ lập trình", "Cơ sở dữ liệu"],
    correct_answer: 0,
    points: 10
  }
];

const mockCourseTest: CourseTest = {
  id: 1,
  title: "Bài kiểm tra JavaScript cơ bản",
  description: "Đánh giá kiến thức JavaScript cơ bản của bạn",
  passing_score: 70,
  time_limit: 30,
  course_id: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  questions: mockTestQuestions
};

const mockTestResults: TestResult[] = [
  {
    id: 1,
    user_id: "demo-user-1",
    course_id: 1,
    course_test_id: 1,
    score: 80,
    passed: true,
    time_taken: 420,
    answers: { "1": 2, "2": 0 },
    created_at: new Date().toISOString()
  }
];

// API giả lập cho bài kiểm tra khóa học
export const fetchCourseTest = async (courseId: string | number): Promise<CourseTest | null> => {
  console.log(`[MOCK] Fetching course test for course ID: ${courseId}`);
  return { ...mockCourseTest, course_id: Number(courseId) };
};

// API giả lập cho bài kiểm tra chương
export const fetchChapterTest = async (chapterId: string | number): Promise<CourseTest | null> => {
  console.log(`[MOCK] Fetching chapter test for chapter ID: ${chapterId}`);
  return {
    ...mockCourseTest,
    id: Number(chapterId) + 100,
    title: `Bài kiểm tra chương ${chapterId}`,
    course_id: 1,
    questions: mockTestQuestions
  };
};

// API giả lập cho lưu kết quả bài kiểm tra
export const saveTestResult = async (result: Partial<TestResult>): Promise<boolean> => {
  console.log('[MOCK] Saving test result:', result);
  return true;
};

// API giả lập cho lấy lịch sử bài kiểm tra
export const fetchTestHistory = async (userId: string, courseId?: string | number): Promise<TestResult[]> => {
  console.log(`[MOCK] Fetching test history for user: ${userId}, course: ${courseId || 'all'}`);
  if (courseId) {
    return mockTestResults.filter(result => 
      result.user_id === userId && result.course_id === Number(courseId)
    );
  }
  return mockTestResults.filter(result => result.user_id === userId);
};

// Added missing functions referenced in the error messages
export const fetchTestQuestions = async (chapterId: string | number): Promise<TestQuestion[]> => {
  console.log(`[MOCK] Fetching test questions for chapter ID: ${chapterId}`);
  return mockTestQuestions;
};

// Add the fetchCourseTests function referenced in errors
export const fetchCourseTests = async (courseId: string | number): Promise<{ success: boolean; test: CourseTest; tests: CourseTest[] }> => {
  console.log(`[MOCK] Fetching all tests for course ID: ${courseId}`);
  return {
    success: true,
    test: { ...mockCourseTest, course_id: Number(courseId) },
    tests: [{ ...mockCourseTest, course_id: Number(courseId) }]
  };
};

export default {
  fetchCourseTest,
  fetchChapterTest,
  saveTestResult,
  fetchTestHistory,
  fetchTestQuestions,
  fetchCourseTests
};
