
// Export selective items from the client file to avoid duplicate exports
export { 
  supabase, 
  checkVipAccess
} from './client';
export type { VipStatus } from './client';

// Export everything from the service files
export * from './apiUtils';
export * from './courseServices';
export * from './certificateServices';

// Handle testServices export to avoid conflict with courseServices
export {
  fetchTestQuestions,
  saveTestResult,
  getChapterTestProgress,
  getUserTestResults,
  getTestProgressChartData
} from './testServices';

// Re-export the second fetchCourseTests under a different name to resolve ambiguity
export { fetchCourseTests as fetchCourseTestsDetails } from './testServices';

export * from './userProgressServices';
