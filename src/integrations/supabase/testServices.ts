
import { supabase } from './client';

// Function to fetch test questions for a course
export const fetchCourseTests = async (courseId: string | number) => {
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
      .eq('course_id', courseId.toString());

    if (error) {
      console.error('Error fetching course tests:', error);
      return { success: false, error };
    }
    
    if (data && data.length > 0) {
      const testData = data[0]; // Use the first test
      const questions = testData.course_test_questions || [];
      
      return { 
        success: true, 
        test: testData,
        questions: questions
      };
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

// Function to fetch test questions for a chapter
export const fetchTestQuestions = async (chapterId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('chapter_tests')
      .select('*')
      .eq('chapter_id', chapterId.toString());

    if (error) {
      console.error('Error fetching chapter test questions:', error);
      return [];
    }

    // Transform the data to match the TestQuestion interface
    return (data || []).map(question => ({
      id: question.id,
      question: question.question,
      options: Array.isArray(question.options) 
        ? question.options.map(opt => typeof opt === 'string' ? opt : String(opt)) 
        : [],
      answer: question.correct_answer
    }));

  } catch (error) {
    console.error('Error fetching chapter test questions:', error);
    return [];
  }
};

// Function to save a test result
export const saveTestResult = async (userId: string, courseId: string | number, testId: string | number, score: number, passed: boolean) => {
  try {
    const { error } = await supabase
      .from('user_test_results')
      .upsert({
        user_id: userId,
        course_id: courseId.toString(),
        course_test_id: testId.toString(),
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
export const getChapterTestProgress = async (userId: string, chapterId: string | number) => {
  try {
    const { data, error } = await supabase
      .from('user_test_results')
      .select('score, passed')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId.toString());

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
