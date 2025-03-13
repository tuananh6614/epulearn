
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
