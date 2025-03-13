
import { supabase } from './client';

// Optimized function to fetch course content with detailed structure
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
    
    // Get chapters, lessons, and tests in parallel for better performance
    const [chaptersResponse, lessonsResponse, testsResponse] = await Promise.all([
      // Get chapters for the course
      supabase
        .from('chapters')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true }),
        
      // Get all lessons for the course
      supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true }),
        
      // Get all course tests
      supabase
        .from('course_tests')
        .select('*')
        .eq('course_id', courseId)
    ]);
    
    // Handle potential errors
    if (chaptersResponse.error) {
      console.error('Error fetching chapters:', chaptersResponse.error);
      throw chaptersResponse.error;
    }
    
    if (lessonsResponse.error) {
      console.error('Error fetching lessons:', lessonsResponse.error);
      throw lessonsResponse.error;
    }
    
    const chaptersData = chaptersResponse.data || [];
    const lessonsData = lessonsResponse.data || [];
    const testsData = testsResponse.data || [];
    
    console.log(`Found ${chaptersData.length} chapters, ${lessonsData.length} lessons, and ${testsData.length} tests`);
    
    // Get all chapter IDs for the chapter tests query
    const chapterIds = chaptersData.map(chapter => chapter.id);
    
    let chapterTestsData = [];
    if (chapterIds.length > 0) {
      const { data, error: testsError } = await supabase
        .from('chapter_tests')
        .select('*')
        .in('chapter_id', chapterIds);
        
      if (testsError) {
        console.error('Error fetching chapter tests:', testsError);
      } else {
        chapterTestsData = data || [];
        console.log(`Found ${chapterTestsData.length} chapter tests`);
      }
    }
    
    // Now organize lessons and tests by chapter
    const structuredChapters = chaptersData.map(chapter => {
      const chapterLessons = lessonsData.filter(lesson => lesson.chapter_id === chapter.id);
      const chapterTests = chapterTestsData.filter(test => test.chapter_id === chapter.id) || [];
      
      return {
        ...chapter,
        lessons: chapterLessons,
        tests: chapterTests
      };
    });
    
    // Return structured course content with tests
    return {
      ...courseData,
      chapters: structuredChapters,
      tests: testsData
    };
    
  } catch (error) {
    console.error('Error fetching course content:', error);
    return null;
  }
};

// Optimized function to fetch course tests
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
    
    // Process the data - optimizing the structure for client-side consumption
    const optimizedTests = testsData.map(test => {
      // Sort questions for consistent ordering
      const sortedQuestions = [...(test.questions || [])].sort((a, b) => {
        return a.id < b.id ? -1 : 1;
      });
      
      return {
        ...test,
        questions: sortedQuestions,
        // Add a helper property for UI display
        questionCount: sortedQuestions.length
      };
    });
    
    console.log('Successfully fetched tests data:', optimizedTests.length);
    return optimizedTests;
  } catch (error) {
    console.error('Error fetching course tests:', error);
    return [];
  }
};

// New: Function to create sample content for a course
export const createSampleCourseContent = async (courseId: string) => {
  try {
    console.log(`Creating sample content for course: ${courseId}`);
    
    // Create sample chapters
    const chapters = [
      { title: "Giới thiệu về khóa học", order_index: 1, description: "Tổng quan và mục tiêu của khóa học" },
      { title: "Kiến thức nền tảng", order_index: 2, description: "Các khái niệm cơ bản cần nắm" },
      { title: "Thực hành và ứng dụng", order_index: 3, description: "Áp dụng kiến thức vào thực tế" }
    ];
    
    const chaptersData = [];
    
    // Insert chapters
    for (const chapter of chapters) {
      const { data, error } = await supabase
        .from('chapters')
        .insert({
          course_id: courseId,
          title: chapter.title,
          order_index: chapter.order_index,
          description: chapter.description
        })
        .select()
        .single();
        
      if (error) {
        console.error(`Error creating chapter "${chapter.title}":`, error);
        continue;
      }
      
      chaptersData.push(data);
    }
    
    console.log(`Created ${chaptersData.length} sample chapters`);
    
    // Create sample lessons for each chapter
    for (const chapter of chaptersData) {
      // Create 3 lessons per chapter
      const lessons = [
        {
          title: `Bài 1: Giới thiệu ${chapter.title}`,
          type: "lesson",
          duration: "15 phút",
          order_index: 1,
          content: `<h2>Giới thiệu ${chapter.title}</h2><p>Đây là nội dung bài học mẫu. Trong bài học này, chúng ta sẽ tìm hiểu về các khía cạnh cơ bản của ${chapter.title}.</p><ul><li>Mục tiêu 1</li><li>Mục tiêu 2</li><li>Mục tiêu 3</li></ul><p>Hãy tiếp tục các bài học tiếp theo để hiểu rõ hơn về chủ đề này.</p>`
        },
        {
          title: `Bài 2: Các khái niệm trong ${chapter.title}`,
          type: "lesson",
          duration: "20 phút",
          order_index: 2,
          content: `<h2>Các khái niệm chính</h2><p>Trong bài học này, chúng ta sẽ tìm hiểu về các khái niệm quan trọng.</p><p>Đây là một đoạn văn mẫu để minh họa nội dung bài học. Trong thực tế, nội dung này sẽ chứa đầy đủ thông tin giáo dục liên quan đến chủ đề.</p><h3>Một số điểm quan trọng:</h3><ol><li>Điểm quan trọng 1</li><li>Điểm quan trọng 2</li><li>Điểm quan trọng 3</li></ol>`
        },
        {
          title: `Bài 3: Thực hành với ${chapter.title}`,
          type: "lesson",
          duration: "25 phút",
          order_index: 3,
          content: `<h2>Thực hành</h2><p>Bây giờ chúng ta sẽ áp dụng những gì đã học vào thực tế.</p><p>Đây là hướng dẫn thực hành chi tiết cho bài học này:</p><pre><code>// Mã mẫu nếu có\nfunction example() {\n  console.log("Đây là ví dụ mã code");\n}</code></pre><p>Sau khi hoàn thành bài thực hành này, bạn sẽ có hiểu biết tốt hơn về chủ đề.</p>`
        }
      ];
      
      // Add a test lesson at the end of each chapter
      lessons.push({
        title: `Kiểm tra: ${chapter.title}`,
        type: "test",
        duration: "15 phút",
        order_index: 4,
        content: `<h2>Bài kiểm tra</h2><p>Đây là bài kiểm tra kiến thức cho phần ${chapter.title}.</p>`
      });
      
      // Insert lessons
      for (const lesson of lessons) {
        const { error } = await supabase
          .from('lessons')
          .insert({
            course_id: courseId,
            chapter_id: chapter.id,
            title: lesson.title,
            type: lesson.type,
            duration: lesson.duration,
            order_index: lesson.order_index,
            content: lesson.content
          });
          
        if (error) {
          console.error(`Error creating lesson "${lesson.title}":`, error);
        }
      }
      
      // Create a sample test for each chapter
      const testQuestions = [
        {
          question: `Câu hỏi 1 về ${chapter.title}?`,
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          correct_answer: 0
        },
        {
          question: `Câu hỏi 2 về ${chapter.title}?`,
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          correct_answer: 1
        },
        {
          question: `Câu hỏi 3 về ${chapter.title}?`,
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          correct_answer: 2
        }
      ];
      
      for (const question of testQuestions) {
        const { error } = await supabase
          .from('chapter_tests')
          .insert({
            chapter_id: chapter.id,
            question: question.question,
            options: question.options,
            correct_answer: question.correct_answer
          });
          
        if (error) {
          console.error(`Error creating test question:`, error);
        }
      }
    }
    
    // Create a final course test
    const { data: testData, error: testError } = await supabase
      .from('course_tests')
      .insert({
        course_id: courseId,
        title: "Bài kiểm tra tổng kết khóa học",
        description: "Kiểm tra kiến thức của bạn sau khi hoàn thành khóa học",
        time_limit: 30,
        passing_score: 70
      })
      .select()
      .single();
      
    if (testError) {
      console.error('Error creating course test:', testError);
    } else if (testData) {
      // Create sample questions for the course test
      const courseTestQuestions = [
        {
          question: "Câu hỏi 1 cho bài kiểm tra cuối khóa?",
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          correct_answer: 0,
          course_test_id: testData.id
        },
        {
          question: "Câu hỏi 2 cho bài kiểm tra cuối khóa?",
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          correct_answer: 1,
          course_test_id: testData.id
        },
        {
          question: "Câu hỏi 3 cho bài kiểm tra cuối khóa?",
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          correct_answer: 2,
          course_test_id: testData.id
        },
        {
          question: "Câu hỏi 4 cho bài kiểm tra cuối khóa?",
          options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          correct_answer: 3,
          course_test_id: testData.id
        }
      ];
      
      const { error: questionError } = await supabase
        .from('course_test_questions')
        .insert(courseTestQuestions);
        
      if (questionError) {
        console.error('Error creating course test questions:', questionError);
      }
    }
    
    console.log('Sample course content created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating sample course content:', error);
    return { success: false, error };
  }
};
