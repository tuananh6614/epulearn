
import { supabase } from './client';
import { updateCourseProgress } from './userProgressServices';

// Define clear types for test data
export interface CourseTestQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  points?: number;
}

export interface CourseTest {
  id: string;
  title: string;
  description?: string;
  time_limit: number;
  passing_score: number;
  questions: CourseTestQuestion[];
}

export interface TestResult {
  id: string;
  user_id: string;
  course_id: string;
  course_test_id: string;
  score: number;
  passed: boolean;
  time_taken?: number;
  created_at?: string;
}

// Optimized helper function for fetching test questions
export const fetchTestQuestions = async (chapterId: string) => {
  try {
    console.log(`Fetching test questions for chapter: ${chapterId}`);
    const { data, error } = await supabase
      .from('chapter_tests')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching test questions:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} test questions for chapter ${chapterId}`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchTestQuestions:', error);
    return [];
  }
};

// Get test questions for a full course
export const fetchCourseTests = async (courseId: string): Promise<CourseTest[]> => {
  try {
    console.log(`Fetching tests for course: ${courseId}`);
    
    // Get all course tests
    const { data: courseTests, error: courseTestsError } = await supabase
      .from('course_tests')
      .select('*')
      .eq('course_id', courseId);
      
    if (courseTestsError) {
      console.error('Error fetching course tests:', courseTestsError);
      throw courseTestsError;
    }
    
    if (!courseTests || courseTests.length === 0) {
      console.log(`No course tests found for course ${courseId}`);
      return [];
    }
    
    // For each test, get its questions
    const testsWithQuestions = await Promise.all(
      courseTests.map(async (test) => {
        const { data: questions, error: questionsError } = await supabase
          .from('course_test_questions')
          .select('*')
          .eq('course_test_id', test.id)
          .order('created_at', { ascending: true });
          
        if (questionsError) {
          console.error(`Error fetching questions for test ${test.id}:`, questionsError);
          return {
            ...test,
            questions: []
          };
        }
        
        // Transform the questions to match the CourseTestQuestion interface
        const formattedQuestions: CourseTestQuestion[] = questions?.map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          correct_answer: q.correct_answer,
          points: q.points || 1
        })) || [];
        
        return {
          id: test.id,
          title: test.title,
          description: test.description,
          time_limit: test.time_limit || 30,
          passing_score: test.passing_score || 70,
          questions: formattedQuestions
        };
      })
    );
    
    return testsWithQuestions;
  } catch (error) {
    console.error('Error in fetchCourseTests:', error);
    return [];
  }
};

// Simple type for test answers
type TestAnswer = {
  questionId: string;
  selectedAnswer: number;
};

// Function to save test result
export const saveTestResult = async (
  userId: string, 
  courseId: string,
  courseTestId: string,
  score: number, 
  passed: boolean,
  timeTaken: number,
  answers: Record<string, number> = {} // Simple key-value for question ID -> answer
): Promise<{ success: boolean, resultId?: string }> => {
  try {
    console.log(`Saving test result for user ${userId}, course ${courseId}, score: ${score}`);
    
    // Format answers as a simple array to avoid deep typing issues
    const formattedAnswers: TestAnswer[] = Object.keys(answers).map(questionId => ({
      questionId,
      selectedAnswer: answers[questionId]
    }));
    
    // Save to user_test_results for analytics
    const { data, error: testResultError } = await supabase
      .from('user_test_results')
      .insert({
        user_id: userId,
        course_id: courseId,
        course_test_id: courseTestId,
        score,
        passed,
        time_taken: timeTaken,
        answers: formattedAnswers as unknown as any, // Use type assertion to avoid deep typing issues
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (testResultError) {
      console.error('Error saving test result:', testResultError);
      return { success: false };
    }
    
    // Then update the course progress
    await updateCourseProgress(userId, courseId);
    
    return {
      success: true,
      resultId: data?.id
    };
  } catch (error) {
    console.error('Error in saveTestResult:', error);
    return {
      success: false
    };
  }
};

// Get user's test results for a course
export const getUserTestResults = async (userId: string, courseId: string): Promise<TestResult[]> => {
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user test results:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserTestResults:', error);
    return [];
  }
};

// Get chapter's test progress
export const getChapterTestProgress = async (userId: string, courseId: string) => {
  try {
    console.log(`Getting chapter test progress for user ${userId}, course ${courseId}`);
    
    // Get all lessons of type 'test' for the course
    const { data: testLessons, error: testLessonsError } = await supabase
      .from('lessons')
      .select('id, chapter_id')
      .eq('course_id', courseId)
      .eq('type', 'test');
      
    if (testLessonsError) {
      console.error('Error fetching test lessons:', testLessonsError);
      throw testLessonsError;
    }
    
    if (!testLessons || testLessons.length === 0) {
      return [];
    }
    
    // Get user progress for these test lessons
    const testLessonIds = testLessons.map(lesson => lesson.id);
    
    const { data: progress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .in('lesson_id', testLessonIds);
      
    if (progressError) {
      console.error('Error fetching test progress:', progressError);
      throw progressError;
    }
    
    // Map the progress to each test lesson
    return testLessons.map(lesson => {
      const lessonProgress = progress?.find(p => p.lesson_id === lesson.id);
      let result = null;
      
      if (lessonProgress?.last_position) {
        try {
          result = JSON.parse(lessonProgress.last_position);
        } catch (e) {
          console.error('Error parsing last_position:', e);
        }
      }
      
      return {
        lessonId: lesson.id,
        chapterId: lesson.chapter_id,
        completed: lessonProgress?.completed || false,
        completedAt: lessonProgress?.completed_at || null,
        result
      };
    });
  } catch (error) {
    console.error('Error in getChapterTestProgress:', error);
    return [];
  }
};
