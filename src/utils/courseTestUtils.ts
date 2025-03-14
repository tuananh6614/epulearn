
// Utility functions for course tests

/**
 * Calculate score from answers
 * @param answers - User's answers
 * @param correctAnswers - Correct answers mapping
 * @returns Score percentage
 */
export const calculateTestScore = (
  answers: Record<number, number | string>,
  correctAnswers: Record<number, number | string>
): number => {
  if (!answers || !correctAnswers || Object.keys(answers).length === 0) {
    return 0;
  }
  
  let correct = 0;
  let total = Object.keys(correctAnswers).length;
  
  Object.entries(answers).forEach(([questionIndex, answer]) => {
    const index = parseInt(questionIndex);
    if (correctAnswers[index] === answer) {
      correct++;
    }
  });
  
  return Math.round((correct / total) * 100);
};

/**
 * Format time for test display
 * @param seconds - Time in seconds
 * @returns Formatted time string (mm:ss)
 */
export const formatTestTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Check if a test has been passed by the user
 * @param score - User's score
 * @param passingScore - Required passing score
 * @returns Boolean indicating if passed
 */
export const hasPassedTest = (score: number, passingScore: number): boolean => {
  return score >= passingScore;
};

/**
 * Get test result feedback based on score
 * @param score - User's score
 * @param passingScore - Required passing score
 * @returns Feedback object with message and status
 */
export const getTestFeedback = (score: number, passingScore: number) => {
  const passed = hasPassedTest(score, passingScore);
  
  if (score === 100) {
    return {
      message: "Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi.",
      status: "excellent"
    };
  } else if (score >= 90) {
    return {
      message: "Rất tốt! Bạn đã nắm vững hầu hết các kiến thức.",
      status: "great"
    };
  } else if (passed) {
    return {
      message: "Chúc mừng! Bạn đã vượt qua bài kiểm tra.",
      status: "passed"
    };
  } else if (score >= passingScore - 10) {
    return {
      message: "Bạn đã rất gần đạt yêu cầu. Hãy ôn tập thêm và thử lại.",
      status: "close"
    };
  } else {
    return {
      message: "Bạn cần ôn tập kỹ hơn trước khi thử lại bài kiểm tra này.",
      status: "failed"
    };
  }
};

/**
 * Generate a default empty test model for new tests
 * @returns Default test object template
 */
export const createEmptyTestModel = () => {
  return {
    title: "Bài kiểm tra mới",
    description: "Mô tả về bài kiểm tra",
    time_limit: 30,
    passing_score: 70,
    questions: [
      {
        question: "Câu hỏi mẫu?",
        options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
        correct_answer: 0
      }
    ]
  };
};

/**
 * Check if VIP features are available based on user's subscription status
 * @param isVip - Whether user has an active VIP subscription
 * @param feature - The feature to check
 * @returns Boolean indicating if the feature is available
 */
export const isVipFeatureAvailable = (isVip: boolean, feature: 'advanced_tests' | 'instructor_support' | 'premium_content' | 'certificates') => {
  if (!isVip) return false;
  return true;
};

/**
 * Generate sample test questions for a course
 * @param count - Number of questions to generate
 * @returns Array of test question objects
 */
export const generateSampleTestQuestions = (count: number = 10) => {
  const questions = [];
  
  const sampleQuestions = [
    {
      question: "Đâu là phương pháp tối ưu để cải thiện hiệu suất trang web?",
      options: ["Thêm nhiều scripts", "Nén hình ảnh", "Sử dụng nhiều CSS inline", "Thêm animations phức tạp"],
      correct_answer: 1
    },
    {
      question: "Khái niệm 'Responsive Design' nghĩa là gì?",
      options: ["Thiết kế nhanh", "Thiết kế thích ứng với nhiều kích thước màn hình", "Thiết kế với nhiều màu sắc", "Thiết kế đơn giản"],
      correct_answer: 1
    },
    {
      question: "Đâu là thẻ HTML dùng để tạo tiêu đề lớn nhất?",
      options: ["<h1>", "<header>", "<heading>", "<h6>"],
      correct_answer: 0
    },
    {
      question: "Chọn đáp án đúng về ngôn ngữ JavaScript?",
      options: ["Chỉ chạy trên server", "Là ngôn ngữ lập trình biên dịch", "Là ngôn ngữ lập trình thông dịch", "Không thể thao tác với DOM"],
      correct_answer: 2
    },
    {
      question: "Phương thức nào dùng để thêm phần tử vào cuối mảng trong JavaScript?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correct_answer: 0
    }
  ];
  
  for (let i = 0; i < count; i++) {
    // Use sample questions and create variations
    const baseQuestion = sampleQuestions[i % sampleQuestions.length];
    
    questions.push({
      question: `${baseQuestion.question} (Biến thể ${Math.floor(i/sampleQuestions.length) + 1})`,
      options: [...baseQuestion.options],
      correct_answer: baseQuestion.correct_answer,
      points: 1
    });
  }
  
  return questions;
};
