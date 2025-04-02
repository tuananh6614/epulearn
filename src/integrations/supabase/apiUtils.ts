
/**
 * API Utils
 * 
 * File giả lập cho các tính năng API
 */
import { SupabaseCourseResponse } from '@/models/lesson';

// Re-export từ apiUtils.ts gốc
export { fetchCourses, fetchVipCourses, fetchFeaturedCourses } from '@/services/apiUtils';

export default {
  fetchCourses,
  fetchVipCourses,
  fetchFeaturedCourses
};
