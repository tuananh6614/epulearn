
import { api } from '@/integrations/api/client';

export const fetchCourseTests = async (courseId: string | number) => {
  try {
    // This is using our mock API client
    const { data: courseData } = await api
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    const { data: testData } = await api
      .from('course_tests')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (!testData || !Array.isArray(testData) || testData.length === 0) {
      return {
        success: true,
        test: {
          id: 1,
          title: "Course Final Test",
          description: "Test your knowledge of this course",
          passing_score: 70,
          time_limit: 30,
          course_id: courseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          questions: [
            {
              id: 1,
              question: "What is React?",
              options: ["A backend framework", "A frontend library", "A database", "An operating system"],
              correct_answer: 1,
              points: 1
            },
            {
              id: 2,
              question: "What language does React use?",
              options: ["Java", "Python", "JavaScript", "C++"],
              correct_answer: 2,
              points: 1
            }
          ]
        }
      };
    }

    return {
      success: true,
      tests: testData
    };
  } catch (error) {
    console.error('Error fetching course tests:', error);
    return { success: false, error: "Failed to fetch course tests" };
  }
};

export const fetchCourseTest = async (courseId: string | number) => {
  try {
    const result = await fetchCourseTests(courseId);
    if (result.success && result.test) {
      return result.test;
    } else if (result.success && result.tests && result.tests.length > 0) {
      return result.tests[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching course test:', error);
    return null;
  }
};

export const fetchChapterTest = async (chapterId: string | number) => {
  try {
    // Use our mock client
    const testData = {
      id: `test-${chapterId}`,
      title: "Chapter Test",
      description: "Test your knowledge of this chapter",
      questions: [
        {
          id: 1,
          question: "What is React?",
          options: ["A backend framework", "A frontend library", "A database", "An operating system"],
          correct_answer: 1,
          points: 1
        },
        {
          id: 2,
          question: "What language does React use?",
          options: ["Java", "Python", "JavaScript", "C++"],
          correct_answer: 2,
          points: 1
        }
      ]
    };
    
    return testData;
  } catch (error) {
    console.error('Error fetching chapter test:', error);
    return null;
  }
};

export const saveTestResult = async (result: any) => {
  try {
    const { data, error } = await api
      .from('user_test_results')
      .insert(result);
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};
