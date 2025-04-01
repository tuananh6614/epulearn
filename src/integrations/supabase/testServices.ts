
import { supabase } from './client';
import { supabaseId, toNumberId } from '@/utils/idConverter';
import { CourseTest, TestQuestion } from '@/models/lesson';
import { PostgrestResponse } from '@supabase/supabase-js';

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
        course_id,
        created_at,
        updated_at,
        course_test_questions (
          id,
          question,
          options,
          correct_answer,
          points
        )
      `)
      .eq('course_id', supabaseId(courseId));

    if (error) {
      console.error('Error fetching course tests:', error);
      return { success: false, error };
    }
    
    if (data && data.length > 0) {
      const testData = data[0]; 
      const questions = testData.course_test_questions || [];
      
      // Transform the raw test data to match our CourseTest interface
      const courseTest: CourseTest = {
        id: testData.id,
        title: testData.title,
        description: testData.description,
        passing_score: testData.passing_score,
        time_limit: testData.time_limit,
        course_id: testData.course_id,
        created_at: testData.created_at,
        updated_at: testData.updated_at,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? 
            q.options.map(opt => String(opt)) : 
            [],
          correct_answer: q.correct_answer,
          points: q.points || 1
        }))
      };
      
      return { 
        success: true, 
        test: courseTest
      };
    }

    return { 
      success: true, 
      tests: data?.map(test => ({
        id: test.id,
        title: test.title,
        description: test.description,
        passing_score: test.passing_score,
        time_limit: test.time_limit,
        course_id: test.course_id,
        created_at: test.created_at,
        updated_at: test.updated_at,
        questions: []
      })) || [] 
    };

  } catch (error) {
    console.error('Error fetching course tests:', error);
    return { success: false, error };
  }
};

// Function to fetch test questions for a chapter
export const fetchTestQuestions = async (chapterId: string | number): Promise<TestQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('chapter_tests')
      .select('*')
      .eq('chapter_id', supabaseId(chapterId));

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
      correct_answer: question.correct_answer
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
        course_id: supabaseId(courseId),
        course_test_id: supabaseId(testId),
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
      .eq('chapter_id', supabaseId(chapterId));

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
