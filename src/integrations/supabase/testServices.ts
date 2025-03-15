
import { supabase } from './client';
import { updateCourseProgress } from './userProgressServices';
import { TestQuestion } from '@/components/ChapterTest';

// Optimized helper function for fetching test questions
export const fetchTestQuestions = async (chapterId: string): Promise<TestQuestion[]> => {
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
    
    // Transform the data to match the TestQuestion interface
    const transformedQuestions: TestQuestion[] = data.map(question => ({
      id: question.id,
      question: question.question,
      options: Array.isArray(question.options) ? question.options as string[] : [],
      answer: question.correct_answer
    }));
    
    return transformedQuestions;
  } catch (error) {
    console.error('Error in fetchTestQuestions:', error);
    return [];
  }
};

// Get test questions for a full course
export const fetchCourseTests = async (courseId: string) => {
  try {
    console.log(`Fetching tests for course: ${courseId}`);
    
    // First, get the course test
    const { data: courseTest, error: courseTestError } = await supabase
      .from('course_tests')
      .select('*')
      .eq('course_id', courseId)
      .maybeSingle();
      
    if (courseTestError) {
      console.error('Error fetching course test:', courseTestError);
      throw courseTestError;
    }
    
    if (!courseTest) {
      console.log(`No course test found for course ${courseId}`);
      return null;
    }
    
    // Then, get all questions for this test
    const { data: questions, error: questionsError } = await supabase
      .from('course_test_questions')
      .select('*')
      .eq('course_test_id', courseTest.id)
      .order('created_at', { ascending: true });
      
    if (questionsError) {
      console.error('Error fetching course test questions:', questionsError);
      throw questionsError;
    }
    
    return {
      test: courseTest,
      questions: questions || []
    };
  } catch (error) {
    console.error('Error in fetchCourseTests:', error);
    return null;
  }
};

// Function to save test result
export const saveTestResult = async (
  userId: string, 
  courseId: string,
  chapterId: string,
  lessonId: string,
  score: number, 
  totalQuestions: number,
  answers: Record<string, any> = {} // Save user's answers
) => {
  try {
    console.log(`Saving test result for user ${userId}, course ${courseId}, score: ${score}/${totalQuestions}`);
    
    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;
    
    // First update the lesson progress
    const { error: progressError } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed: passed,
        last_position: JSON.stringify({
          score,
          total: totalQuestions,
          percentage
        }),
        completed_at: passed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      });
      
    if (progressError) {
      console.error('Error updating lesson progress:', progressError);
      throw progressError;
    }
    
    // Then update the course progress
    await updateCourseProgress(userId, courseId);
    
    // Also save to user_test_results for analytics
    const { error: testResultError } = await supabase
      .from('user_test_results')
      .insert({
        user_id: userId,
        course_id: courseId,
        chapter_id: chapterId,
        score: percentage,
        passed,
        answers,
        time_taken: 0, // We'll assume 0 for now
        created_at: new Date().toISOString()
      });
      
    if (testResultError) {
      console.error('Error saving test result:', testResultError);
      // We don't throw here because we want to proceed even if this fails
    }
    
    return {
      success: true,
      score: percentage,
      passed
    };
  } catch (error) {
    console.error('Error in saveTestResult:', error);
    return {
      success: false,
      error
    };
  }
};

// Get user's chapter tests progress
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

// Get highest test score for a specific chapter test
export const getHighestChapterTestScore = async (userId: string, chapterId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select('score')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .order('score', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error fetching highest test score:', error);
      throw error;
    }
    
    return data && data.length > 0 ? data[0].score : null;
  } catch (error) {
    console.error('Error in getHighestChapterTestScore:', error);
    return null;
  }
};

// Get all test history for a user
export const getUserTestHistory = async (userId: string, courseId?: string) => {
  try {
    let query = supabase
      .from('user_test_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching test history:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserTestHistory:', error);
    return [];
  }
};
