
/**
 * API Utils
 * 
 * File giả lập cho các tính năng API
 */
import { SupabaseCourseResponse } from '@/models/lesson';
import { 
  fetchCourses as fetchCoursesOriginal, 
  fetchVipCourses as fetchVipCoursesOriginal, 
  fetchFeaturedCourses as fetchFeaturedCoursesOriginal 
} from '@/services/apiUtils';

// Re-export from the original apiUtils.ts
export { 
  fetchCourses,
  fetchVipCourses,
  fetchFeaturedCourses
} from '@/services/apiUtils';

// Define the exported object with the re-exported functions
const apiUtils = {
  fetchCourses: fetchCoursesOriginal,
  fetchVipCourses: fetchVipCoursesOriginal,
  fetchFeaturedCourses: fetchFeaturedCoursesOriginal
};

export default apiUtils;
