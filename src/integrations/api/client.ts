
// Mock API client to replace Supabase

export interface VipStatus {
  isVip: boolean;
  daysRemaining: number | null;
}

// Check user's VIP status (mock function)
export const checkVipAccess = async (userId: string): Promise<VipStatus> => {
  console.log(`[MOCK] Checking VIP access for user ${userId}`);
  // Mock VIP users
  const mockVipUsers = ['demo-user-1'];
  const isVip = mockVipUsers.includes(userId);
  
  return {
    isVip,
    daysRemaining: isVip ? 30 : null
  };
};

// Create a function to save lesson progress
export const saveLessonProgress = async (
  userId: string,
  courseId: string | number,
  chapterId: string | number,
  lessonId: string | number,
  position?: any,
  completed?: boolean,
  currentPageId?: string | number
) => {
  console.log(`[MOCK] Saving lesson progress for user ${userId}, lesson ${lessonId}`);
  const progress = {
    user_id: userId,
    course_id: courseId,
    chapter_id: chapterId,
    lesson_id: lessonId,
    last_position: position ? JSON.stringify(position) : null,
    completed: completed !== undefined ? completed : true,
    current_page_id: currentPageId,
    updated_at: new Date().toISOString()
  };
  
  // Save to local storage as a mock
  const storageKey = `lesson_progress_${userId}_${lessonId}`;
  localStorage.setItem(storageKey, JSON.stringify(progress));
  
  return progress;
};

// Function to get lesson pages
export const getLessonPages = async (lessonId: string | number) => {
  console.log(`[MOCK] Fetching pages for lesson ${lessonId}`);
  
  // Return mock pages
  return {
    success: true,
    pages: [
      {
        id: 1,
        lesson_id: lessonId,
        title: "Introduction",
        content: "<p>Welcome to this lesson</p>",
        order_index: 1
      },
      {
        id: 2,
        lesson_id: lessonId,
        title: "Main Content",
        content: "<p>This is the main content of the lesson</p>",
        order_index: 2
      }
    ]
  };
};

// Mock function to fetch chapter test
export const fetchChapterTest = async (chapterId: string | number) => {
  console.log(`[MOCK] Fetching chapter test for ${chapterId}`);
  return {
    id: 1,
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
};

// Mock function to fetch course tests
export const fetchCourseTests = async (courseId: string | number) => {
  console.log(`[MOCK] Fetching course tests for ${courseId}`);
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
};

// Mock function to fetch a specific course test
export const fetchCourseTest = async (courseId: string | number) => {
  const { test } = await fetchCourseTests(courseId);
  return test;
};

// Mock function to save test result
export const saveTestResult = async (result: any) => {
  console.log("[MOCK] Saving test result", result);
  
  // Save to local storage as a mock
  const storageKey = `test_result_${result.user_id}_${result.course_id}`;
  const existingResults = JSON.parse(localStorage.getItem(storageKey) || '[]');
  existingResults.push({
    ...result,
    id: Date.now(),
    created_at: new Date().toISOString()
  });
  localStorage.setItem(storageKey, JSON.stringify(existingResults));
  
  return true;
};

// Mock storage functionality
export const storage = {
  from: (bucket: string) => ({
    upload: async (path: string, file: File) => {
      console.log(`[MOCK] Uploading file to ${bucket}/${path}`);
      return { data: { path }, error: null };
    },
    getPublicUrl: (path: string) => {
      return { data: { publicUrl: `/mock-storage/${path}` } };
    }
  })
};

// Mock API methods with enhanced functionality
export const api = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      console.log('[MOCK] Sign in with:', credentials.email);
      
      if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
        return { 
          data: { 
            user: { 
              id: 'demo-user-1',
              email: credentials.email
            },
            session: {
              access_token: 'mock-token'
            }
          }, 
          error: null 
        };
      }
      
      return { data: null, error: { message: 'Invalid login credentials' } };
    },
    signUp: async (credentials: { email: string; password: string; }) => {
      console.log('[MOCK] Sign up with:', credentials.email);
      return { 
        data: { 
          user: { 
            id: 'new-user-' + Date.now(),
            email: credentials.email
          }
        }, 
        error: null 
      };
    },
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: async () => ({ data: {}, error: null })
  },
  
  // Generic data methods with enhanced functionality
  from: (table: string) => ({
    select: (...columns: string[]) => ({
      eq: (field: string, value: any) => ({
        single: () => {
          console.log(`[MOCK] Fetching single item from ${table} where ${field}=${value}`);
          return Promise.resolve({ 
            data: { 
              id: value, 
              title: `Mock ${table} Title`,
              description: `Mock description for ${table}`
            }, 
            error: null 
          });
        },
        maybeSingle: () => {
          console.log(`[MOCK] Maybe fetching single item from ${table} where ${field}=${value}`);
          return Promise.resolve({ 
            data: { 
              id: value, 
              title: `Mock ${table} Title`,
              description: `Mock description for ${table}`
            }, 
            error: null 
          });
        },
        limit: (count: number) => ({
          data: Array(count).fill(0).map((_, i) => ({
            id: `${value}-${i}`,
            title: `Mock ${table} Title ${i}`,
            description: `Mock description for ${table} ${i}`
          })),
          error: null
        }),
        order: (column: string, { ascending = true }) => ({
          data: [
            { 
              id: `${value}-0`, 
              title: `Mock ${table} Title 0`,
              description: `Mock description for ${table} 0`,
              order_index: 0
            },
            { 
              id: `${value}-1`, 
              title: `Mock ${table} Title 1`,
              description: `Mock description for ${table} 1`,
              order_index: 1
            }
          ],
          error: null
        }),
      }),
      order: (column: string, { ascending = true }) => ({
        data: [
          { id: '1', title: `Mock ${table} Title 1`, order_index: 0 },
          { id: '2', title: `Mock ${table} Title 2`, order_index: 1 }
        ],
        error: null
      }),
      data: [
        { id: '1', title: `Mock ${table} Item 1` },
        { id: '2', title: `Mock ${table} Item 2` }
      ],
      error: null
    }),
    insert: (data: any) => Promise.resolve({ data, error: null }),
    update: (data: any) => ({
      eq: (field: string, value: any) => Promise.resolve({ data, error: null })
    }),
    upsert: (data: any) => Promise.resolve({ data, error: null }),
    delete: () => ({
      eq: (field: string, value: any) => Promise.resolve({ error: null })
    })
  })
};

export default { api, storage, checkVipAccess };
