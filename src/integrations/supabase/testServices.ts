import { supabase } from './client';

// Function to fetch test questions for a course
export const fetchCourseTests = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_tests')
      .select(`
        id, 
        title, 
        description, 
        passing_score, 
        time_limit,
        course_test_questions (
          id,
          question,
          options,
          correct_answer,
          points
        )
      `)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error fetching course tests:', error);
      return { success: false, error };
    }

    return { 
      success: true, 
      tests: data || [] 
    };

  } catch (error) {
    console.error('Error fetching course tests:', error);
    return { success: false, error };
  }
};

// Function to save a test result
export const saveTestResult = async (userId: string, courseId: number, testId: number, score: number, passed: boolean) => {
  try {
    const { error } = await supabase
      .from('user_test_results')
      .upsert({
        user_id: userId,
        course_id: courseId,
        test_id: testId,
        score,
        passed,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving test result:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception saving test result:', error);
    return { success: false, error };
  }
};

// Function to get chapter test progress
export const getChapterTestProgress = async (userId: string, chapterId: number) => {
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select('score, passed')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId);

    if (error) {
      console.error('Error fetching chapter test progress:', error);
      return { success: false, error };
    }

    return { 
      success: true, 
      results: data || [] 
    };
  } catch (error) {
    console.error('Error fetching chapter test progress:', error);
    return { success: false, error };
  }
};
