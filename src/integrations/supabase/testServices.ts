
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

// Optimized function to save test result
export const saveTestResult = async (
  userId: string, 
  courseId: string,
  chapterId: string,
  lessonId: string,
  score: number, 
  totalQuestions: number
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
        score: percentage,
        passed,
        time_taken: 0, // This could be enhanced to track time
        answers: {}
      });
      
    if (testResultError) {
      console.error('Error saving test result:', testResultError);
      // We don't throw here as it's optional analytics data
    }
    
    console.log(`Test result saved successfully. Passed: ${passed}, Score: ${percentage}%`);
    return { success: true, passed, percentage };
  } catch (error) {
    console.error('Error in saveTestResult:', error);
    return { success: false, error };
  }
};

// New function to fetch course tests with optimized loading
export const fetchCourseTestsOptimized = async (courseId: string) => {
  try {
    console.log('Fetching course tests for course:', courseId);
    
    // Use a single query with join to reduce API calls
    const { data, error } = await supabase
      .from('course_tests')
      .select(`
        *,
        questions:course_test_questions(*)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching course tests:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No tests found for course:', courseId);
      return [];
    }
    
    // Process the data for better client-side consumption
    const processedTests = data.map(test => ({
      ...test,
      questionCount: test.questions?.length || 0,
      // Sort questions by id to ensure consistent order
      questions: (test.questions || []).sort((a, b) => 
        a.id < b.id ? -1 : a.id > b.id ? 1 : 0
      )
    }));
    
    console.log(`Successfully fetched ${processedTests.length} tests for course ${courseId}`);
    return processedTests;
  } catch (error) {
    console.error('Error in fetchCourseTestsOptimized:', error);
    return [];
  }
};

// New: Function to create a test for a course
export const createCourseTest = async (
  courseId: string,
  title: string,
  description: string,
  timeLimit: number,
  passingScore: number,
  questions: any[]
) => {
  try {
    console.log(`Creating new test for course ${courseId} with ${questions.length} questions`);
    
    // First insert the test
    const { data: testData, error: testError } = await supabase
      .from('course_tests')
      .insert({
        course_id: courseId,
        title,
        description,
        time_limit: timeLimit,
        passing_score: passingScore
      })
      .select()
      .single();
      
    if (testError) {
      console.error('Error creating test:', testError);
      throw testError;
    }
    
    if (!testData) {
      throw new Error('Failed to create test, no data returned');
    }
    
    // Then insert all questions
    const questionsWithTestId = questions.map(q => ({
      ...q,
      course_test_id: testData.id
    }));
    
    const { error: questionsError } = await supabase
      .from('course_test_questions')
      .insert(questionsWithTestId);
      
    if (questionsError) {
      console.error('Error creating test questions:', questionsError);
      throw questionsError;
    }
    
    console.log(`Test created successfully with ID ${testData.id}`);
    return { success: true, testId: testData.id };
  } catch (error) {
    console.error('Error in createCourseTest:', error);
    return { success: false, error };
  }
};

// New: Function to check if user has active VIP access
export const checkVipAccess = async (userId: string) => {
  try {
    if (!userId) return { isVip: false };
    
    console.log('Checking VIP access for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_vip, vip_expiration_date')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error checking VIP status:', error);
      return { isVip: false, error };
    }
    
    if (!data) {
      return { isVip: false };
    }
    
    // Check if VIP and not expired
    const isVip = !!data.is_vip;
    const expirationDate = data.vip_expiration_date ? new Date(data.vip_expiration_date) : null;
    const isExpired = expirationDate ? expirationDate < new Date() : false;
    
    if (isVip && isExpired) {
      console.log('VIP subscription expired, revoking access');
      // Auto revoke VIP status if expired
      await supabase
        .from('profiles')
        .update({ 
          is_vip: false,
          vip_expiration_date: null
        })
        .eq('id', userId);
        
      return { isVip: false, isExpired: true };
    }
    
    console.log(`User ${userId} VIP status: ${isVip}, Expires: ${expirationDate?.toISOString() || 'N/A'}`);
    return { 
      isVip, 
      expirationDate,
      daysRemaining: expirationDate ? 
        Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 
        null 
    };
  } catch (error) {
    console.error('Error in checkVipAccess:', error);
    return { isVip: false, error };
  }
};
