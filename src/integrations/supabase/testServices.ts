
import { supabase } from './client';
import { updateCourseProgress } from './userProgressServices';

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
    
    // Get current attempt count for this test
    const { data: attempts, error: attemptsError } = await supabase
      .from('user_test_results')
      .select('attempt_number')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .order('attempt_number', { ascending: false })
      .limit(1);
      
    const attemptNumber = attempts && attempts.length > 0 
      ? attempts[0].attempt_number + 1 
      : 1;
    
    // Save to user_test_results for analytics and progress tracking
    const { error: testResultError } = await supabase
      .from('user_test_results')
      .insert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        score: percentage,
        passed,
        answers,
        time_taken: 0, // We'll assume 0 for now
        attempt_number: attemptNumber,
        test_name: `Chapter ${chapterId} Test`,
        created_at: new Date().toISOString()
      });
      
    if (testResultError) {
      console.error('Error saving test result:', testResultError);
      // We don't throw here because we want to proceed even if this fails
    }
    
    return {
      success: true,
      score: percentage,
      passed,
      attemptNumber
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
    
    // Get test result history for these lessons
    const { data: testResults, error: resultsError } = await supabase
      .from('user_test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .in('lesson_id', testLessonIds)
      .order('created_at', { ascending: false });
      
    if (resultsError) {
      console.error('Error fetching test results:', resultsError);
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
      
      // Get all attempts for this lesson
      const lessonResults = testResults?.filter(r => r.lesson_id === lesson.id) || [];
      
      return {
        lessonId: lesson.id,
        chapterId: lesson.chapter_id,
        completed: lessonProgress?.completed || false,
        completedAt: lessonProgress?.completed_at || null,
        result,
        attempts: lessonResults.length,
        bestScore: lessonResults.length > 0 
          ? Math.max(...lessonResults.map(r => r.score)) 
          : null,
        recentResults: lessonResults.slice(0, 5)
      };
    });
  } catch (error) {
    console.error('Error in getChapterTestProgress:', error);
    return [];
  }
};

// Get all test results for a user across all courses or a specific course
export const getUserTestResults = async (userId: string, courseId?: string) => {
  try {
    let query = supabase
      .from('user_test_results')
      .select(`
        *,
        courses (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;
    
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

// Get progress chart data for a specific test
export const getTestProgressChartData = async (userId: string, lessonId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select('score, created_at, attempt_number')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching test progress chart data:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getTestProgressChartData:', error);
    return [];
  }
};
