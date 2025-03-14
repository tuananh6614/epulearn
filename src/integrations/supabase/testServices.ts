
import { supabase } from './client';

// Function to fetch test questions for a chapter
export const fetchTestQuestions = async (lessonId: string, chapterId: string) => {
  try {
    console.log(`Fetching test questions for lesson: ${lessonId}, chapter: ${chapterId}`);
    
    const { data, error } = await supabase
      .from('chapter_tests')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching test questions:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} test questions`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchTestQuestions:', error);
    return [];
  }
};

// Function to save test result
export const saveTestResult = async (
  userId: string,
  courseId: string,
  courseTestId: string,
  score: number,
  passed: boolean,
  answers: any,
  timeTaken: number,
  testName: string = 'Course Test'
) => {
  try {
    // Check if user has attempted this test before
    const { data: previousAttempts, error: countError } = await supabase
      .from('user_test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('course_test_id', courseTestId)
      .order('created_at', { ascending: false });
    
    if (countError) {
      console.error('Error checking previous attempts:', countError);
    }
    
    // Calculate attempt number
    const attemptNumber = previousAttempts && previousAttempts.length > 0 
      ? previousAttempts.length + 1 
      : 1;
    
    // Save the test result
    const { data, error } = await supabase
      .from('user_test_results')
      .insert({
        user_id: userId,
        course_id: courseId,
        course_test_id: courseTestId,
        score,
        passed,
        answers,
        time_taken: timeTaken,
        test_name: testName,
        attempt_number: attemptNumber
      })
      .select();
    
    if (error) {
      console.error('Error saving test result:', error);
      throw error;
    }
    
    console.log('Test result saved successfully:', data);
    return data[0];
  } catch (error) {
    console.error('Error in saveTestResult:', error);
    throw error;
  }
};

// Function to get chapter test progress
export const getChapterTestProgress = async (userId: string, chapterId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching chapter test progress:', error);
      throw error;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getChapterTestProgress:', error);
    return null;
  }
};

// Function to fetch course tests
export const fetchCourseTests = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('course_tests')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching course tests:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCourseTests:', error);
    return [];
  }
};

// Function to get user test results
export const getUserTestResults = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select(`
        *,
        courses (
          title,
          description,
          thumbnail_url,
          category,
          level
        )
      `)
      .eq('user_id', userId)
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

// Function to get test progress chart data
export const getTestProgressChartData = async (userId: string, lessonId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select('score, created_at, attempt_number')
      .eq('user_id', userId)
      .eq('course_test_id', lessonId)
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
