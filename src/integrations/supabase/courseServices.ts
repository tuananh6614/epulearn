
import { supabase } from './client';

// Fetch course content with detailed structure
export const fetchCourseContent = async (courseId: string) => {
  try {
    console.log('Fetching course content for course:', courseId);
    
    // First get the course details
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
      
    if (courseError) {
      console.error('Error fetching course details:', courseError);
      throw courseError;
    }
    
    if (!courseData) {
      console.log('No course found with ID:', courseId);
      return null;
    }
    
    // Then get chapters for the course
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
      
    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      throw chaptersError;
    }
    
    // Now get all lessons for the course
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
      
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw lessonsError;
    }
    
    // Get all chapter tests - fetch for all chapters at once
    const chapterIds = chaptersData.map(chapter => chapter.id);
    
    let testsData = [];
    if (chapterIds.length > 0) {
      const { data, error: testsError } = await supabase
        .from('chapter_tests')
        .select('*')
        .in('chapter_id', chapterIds);
        
      if (testsError) {
        console.error('Error fetching chapter tests:', testsError);
      } else {
        testsData = data || [];
      }
    }
    
    // Now organize lessons by chapter
    const structuredChapters = chaptersData.map(chapter => {
      const chapterLessons = lessonsData.filter(lesson => lesson.chapter_id === chapter.id);
      const chapterTests = testsData.filter(test => test.chapter_id === chapter.id) || [];
      
      return {
        ...chapter,
        lessons: chapterLessons,
        tests: chapterTests
      };
    });
    
    // Return structured course content
    return {
      ...courseData,
      chapters: structuredChapters
    };
    
  } catch (error) {
    console.error('Error fetching course content:', error);
    return null;
  }
};

// Tối ưu hóa hàm fetchCourseTests để cải thiện hiệu suất
export const fetchCourseTests = async (courseId: string) => {
  try {
    console.log('Fetching course tests for course:', courseId);
    
    // Fetch test info with single query containing both tests and questions
    const { data: testsData, error: testsError } = await supabase
      .from('course_tests')
      .select(`
        *,
        questions:course_test_questions(*)
      `)
      .eq('course_id', courseId);
      
    if (testsError) {
      console.error('Error fetching course tests:', testsError);
      throw testsError;
    }
    
    if (!testsData || testsData.length === 0) {
      console.log('No tests found for course:', courseId);
      return [];
    }
    
    console.log('Successfully fetched tests data:', testsData.length);
    return testsData;
  } catch (error) {
    console.error('Error fetching course tests:', error);
    return [];
  }
};
