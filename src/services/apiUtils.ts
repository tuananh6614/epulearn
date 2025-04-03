
// Simplified mock API utils without Supabase

export interface SupabaseCourseResponse {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  level: string;
  duration: string;
  is_premium: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  status: string;
  instructor: string;
  price: string;
  discount_price: string | null;
  full_description: string;
  objectives: string[];
  requirements: string[];
  image: string;
  color: string;
  isPremium: boolean;
  discountPrice: string | null;
  isFeatured: boolean;
}

export interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
  progress: number;
  isCompleted: boolean;
  lastAccessed: string;
  enrolledAt: string;
  status: string;
}

export interface UserCertificate {
  id: number;
  userId: string;
  courseId: number;
  certificateId: string;
  issueDate: string;
  courseName: string;
}

// Mock data for courses
const mockCourses: SupabaseCourseResponse[] = [
  {
    id: 1,
    title: "JavaScript Basics",
    description: "Learn the fundamentals of JavaScript",
    thumbnail_url: "/placeholder.svg",
    category: "JavaScript",
    level: "Beginner",
    duration: "3h",
    is_premium: false,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "published",
    instructor: "EPU Learning",
    price: "0₫",
    discount_price: null,
    full_description: "A comprehensive introduction to JavaScript",
    objectives: ["Learn basic syntax", "Understand functions", "Work with arrays"],
    requirements: ["Basic HTML knowledge"],
    image: "/placeholder.svg",
    color: "yellow",
    isPremium: false,
    discountPrice: null,
    isFeatured: true
  },
  {
    id: 2,
    title: "React Fundamentals",
    description: "Master React.js basics",
    thumbnail_url: "/placeholder.svg",
    category: "React",
    level: "Intermediate",
    duration: "5h",
    is_premium: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "published",
    instructor: "EPU Learning",
    price: "299.000₫",
    discount_price: "149.000₫",
    full_description: "Learn to build modern UIs with React",
    objectives: ["Component basics", "State management", "Hooks"],
    requirements: ["JavaScript knowledge"],
    image: "/placeholder.svg",
    color: "blue",
    isPremium: true,
    discountPrice: "149.000₫",
    isFeatured: true
  }
];

// Mock data for enrolled courses
const mockEnrolledCourses: Record<string, EnrolledCourse[]> = {
  'demo-user-1': [
    {
      id: 1,
      title: "JavaScript Basics",
      description: "Learn the fundamentals of JavaScript",
      image: "/placeholder.svg",
      color: "yellow",
      progress: 75,
      isCompleted: false,
      lastAccessed: new Date().toISOString(),
      enrolledAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: "published"
    }
  ]
};

// Enhanced cache structure
const cache = {
  enrolledCourses: new Map<string, { data: EnrolledCourse[], timestamp: number }>(),
  courses: { data: mockCourses as SupabaseCourseResponse[], timestamp: Date.now() },
  featuredCourses: { data: mockCourses.filter(c => c.is_featured) as SupabaseCourseResponse[], timestamp: Date.now() },
  vipCourses: { data: mockCourses.filter(c => c.is_premium) as SupabaseCourseResponse[], timestamp: Date.now() },
  certificates: new Map<string, { data: UserCertificate[], timestamp: number }>(),
  CACHE_TIME: 120000,
};

// Check if cache is valid
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < cache.CACHE_TIME;
};

// Fetch enrolled courses
export const fetchUserEnrolledCourses = async (userId: string): Promise<EnrolledCourse[]> => {
  try {
    if (!userId) {
      console.log('No user ID provided for fetching enrolled courses');
      return [];
    }

    // Check cache
    const cachedData = cache.enrolledCourses.get(userId);
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      console.log('Using cached enrolled courses data');
      return cachedData.data;
    }

    console.log('Fetching enrolled courses for user:', userId);
    
    // Get mock enrolled courses
    const enrolledCourses = mockEnrolledCourses[userId] || [];
    
    // Update cache
    cache.enrolledCourses.set(userId, {
      data: enrolledCourses,
      timestamp: Date.now()
    });
    
    return enrolledCourses;
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};

// Function to fetch courses
export const fetchCourses = async (): Promise<SupabaseCourseResponse[]> => {
  try {
    // Check cache
    if (cache.courses.data && isCacheValid(cache.courses.timestamp)) {
      console.log('Using cached courses data');
      return cache.courses.data;
    }
    
    console.log('Fetching courses');
    return mockCourses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

// Function to fetch VIP courses
export const fetchVipCourses = async (): Promise<SupabaseCourseResponse[]> => {
  try {
    // Check cache
    if (cache.vipCourses.data && isCacheValid(cache.vipCourses.timestamp)) {
      console.log('Using cached VIP courses data');
      return cache.vipCourses.data;
    }
    
    console.log('Fetching VIP courses');
    return mockCourses.filter(course => course.is_premium);
  } catch (error) {
    console.error('Error fetching VIP courses:', error);
    return [];
  }
};

// Function to fetch featured courses
export const fetchFeaturedCourses = async (): Promise<SupabaseCourseResponse[]> => {
  try {
    // Check cache
    if (cache.featuredCourses.data && isCacheValid(cache.featuredCourses.timestamp)) {
      console.log('Using cached featured courses data');
      return cache.featuredCourses.data;
    }
    
    console.log('Fetching featured courses');
    return mockCourses.filter(course => course.is_featured);
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    return [];
  }
};

// Function to fetch user certificates
export const fetchUserCertificates = async (userId: string): Promise<UserCertificate[]> => {
  try {
    if (!userId) {
      return [];
    }
    
    // Check cache
    const cachedData = cache.certificates.get(userId);
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data;
    }
    
    // Mock certificates
    const certificates: UserCertificate[] = [
      {
        id: 1,
        userId: userId,
        courseId: 1,
        certificateId: 'CERT-1234',
        issueDate: new Date().toISOString(),
        courseName: 'JavaScript Basics'
      }
    ];
    
    // Update cache
    cache.certificates.set(userId, {
      data: certificates,
      timestamp: Date.now()
    });
    
    return certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
};

// Function to check API health
export const checkApiHealth = async (): Promise<boolean> => {
  return true; // Always return true for mock version
};

// Function to fetch certification programs
export const fetchCertificationPrograms = async () => {
  try {
    return mockCourses.filter(course => course.is_premium).map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      requirements: [
        `Kiến thức cơ bản về ${course.category}`,
        `Hoàn thành tất cả các bài học trong khóa học`,
        `Đạt điểm tối thiểu 80% trong bài kiểm tra cuối khóa`
      ]
    }));
  } catch (error) {
    console.error('Error fetching certification programs:', error);
    return [];
  }
};

// Clear cache
export const clearCache = () => {
  cache.enrolledCourses.clear();
  cache.courses.timestamp = 0;
  cache.featuredCourses.timestamp = 0;
  cache.vipCourses.timestamp = 0;
  cache.certificates.clear();
  console.log('Cache cleared');
};

// Enroll user in course
export const enrollUserInCourse = async (userId: string, courseId: string | number): Promise<{ success: boolean, error?: any }> => {
  try {
    console.log(`[MOCK] Enrolling user ${userId} in course ${courseId}`);
    
    // Mock enrollment logic
    if (!mockEnrolledCourses[userId]) {
      mockEnrolledCourses[userId] = [];
    }
    
    const courseIdNum = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    const course = mockCourses.find(c => c.id === courseIdNum);
    
    if (course && !mockEnrolledCourses[userId].find(c => c.id === courseIdNum)) {
      mockEnrolledCourses[userId].push({
        id: courseIdNum,
        title: course.title,
        description: course.description,
        image: course.image,
        color: course.color,
        progress: 0,
        isCompleted: false,
        lastAccessed: new Date().toISOString(),
        enrolledAt: new Date().toISOString(),
        status: "published"
      });
      
      // Clear cache
      cache.enrolledCourses.delete(userId);
    }

    return { success: true };
  } catch (error) {
    console.error('Exception enrolling user in course:', error);
    return { success: false, error };
  }
};

export default {
  fetchUserEnrolledCourses,
  fetchCourses,
  fetchVipCourses,
  fetchFeaturedCourses,
  fetchUserCertificates,
  checkApiHealth,
  fetchCertificationPrograms,
  clearCache,
  enrollUserInCourse
};
