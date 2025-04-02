
/**
 * API Utils
 * 
 * File giả lập cho các tính năng API
 */
import { SupabaseCourseResponse } from '@/models/lesson';
import { fetchCourses as fetchCoursesOriginal, 
         fetchVipCourses as fetchVipCoursesOriginal, 
         fetchFeaturedCourses as fetchFeaturedCoursesOriginal } from '@/services/apiUtils';

// Re-export từ apiUtils.ts gốc
export { fetchCourses, fetchVipCourses, fetchFeaturedCourses } from '@/services/apiUtils';

const fetchCourses = fetchCoursesOriginal;
const fetchVipCourses = fetchVipCoursesOriginal;
const fetchFeaturedCourses = fetchFeaturedCoursesOriginal;

export default {
  fetchCourses,
  fetchVipCourses,
  fetchFeaturedCourses
};
