
import { supabase } from './client';
import { toast } from 'sonner';

// Get lesson content from Supabase
export const fetchLessonContent = async (lessonId: string) => {
  try {
    console.log(`Fetching content for lesson: ${lessonId}`);
    
    // Get the lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
      
    if (lessonError) {
      console.error('Error fetching lesson:', lessonError);
      throw lessonError;
    }
    
    if (!lesson) {
      console.log(`No lesson found with ID ${lessonId}`);
      return null;
    }
    
    // Get the chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('title')
      .eq('id', lesson.chapter_id)
      .single();
      
    if (chapterError) {
      console.error('Error fetching chapter:', chapterError);
      // We don't throw here because we still want to return the lesson
    }
    
    // Get next and previous lessons
    const { data: allLessons, error: allLessonsError } = await supabase
      .from('lessons')
      .select('id, order_index')
      .eq('course_id', lesson.course_id)
      .order('order_index', { ascending: true });
      
    if (allLessonsError) {
      console.error('Error fetching all lessons:', allLessonsError);
      // We don't throw here because we still want to return the lesson
    }
    
    // Find the current lesson index
    const currentIndex = allLessons?.findIndex(l => l.id === lessonId) || -1;
    let nextLesson = null;
    let prevLesson = null;
    
    if (currentIndex !== -1 && allLessons) {
      if (currentIndex > 0) {
        prevLesson = allLessons[currentIndex - 1].id;
      }
      
      if (currentIndex < allLessons.length - 1) {
        nextLesson = allLessons[currentIndex + 1].id;
      }
    }
    
    // Check if user has already completed this lesson
    // This would need to be implemented based on your auth and progress tracking
    
    return {
      ...lesson,
      chapterTitle: chapter?.title || 'Unknown Chapter',
      nextLesson,
      prevLesson
    };
  } catch (error) {
    console.error('Error in fetchLessonContent:', error);
    toast.error("Không thể tải nội dung bài học");
    return null;
  }
};

// Mark a lesson as completed
export const markLessonAsCompleted = async (userId: string, courseId: string, lessonId: string) => {
  try {
    console.log(`Marking lesson ${lessonId} as completed for user ${userId}`);
    
    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error marking lesson as completed:', error);
      throw error;
    }
    
    // Update overall course progress
    // This would be implemented in your progress tracking service
    
    return { success: true };
  } catch (error) {
    console.error('Error in markLessonAsCompleted:', error);
    return { success: false, error };
  }
};

// Get content for a test
export const fetchTestContent = async (lessonId: string, chapterId: string) => {
  try {
    console.log(`Fetching test content for lesson: ${lessonId}, chapter: ${chapterId}`);
    
    // First get the test lesson info
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
      
    if (lessonError) {
      console.error('Error fetching test lesson:', lessonError);
      throw lessonError;
    }
    
    if (!lesson || lesson.type !== 'test') {
      console.log(`Lesson ${lessonId} is not a test`);
      return null;
    }
    
    // Get test questions
    const { data: questions, error: questionsError } = await supabase
      .from('chapter_tests')
      .select('*')
      .eq('chapter_id', chapterId);
      
    if (questionsError) {
      console.error('Error fetching test questions:', questionsError);
      throw questionsError;
    }
    
    // Get chapter info for title
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('title')
      .eq('id', chapterId)
      .single();
      
    if (chapterError) {
      console.error('Error fetching chapter:', chapterError);
      // We don't throw here because we still want to return the test
    }
    
    return {
      title: `Bài kiểm tra: ${chapter?.title || 'Chương không xác định'}`,
      description: 'Hãy hoàn thành bài kiểm tra để đánh giá kiến thức của bạn',
      timeLimit: 15, // 15 minutes by default
      questions: questions?.map(q => ({
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correct_answer
      })) || []
    };
  } catch (error) {
    console.error('Error in fetchTestContent:', error);
    toast.error("Không thể tải nội dung bài kiểm tra");
    return null;
  }
};

export default {
  fetchLessonContent,
  markLessonAsCompleted,
  fetchTestContent
};
