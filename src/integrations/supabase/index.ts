
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

// Similar to client.ts, selectively export from testServices to avoid duplicates
export { 
  fetchTestQuestions, 
  saveTestResult, 
  getChapterTestProgress,
  fetchCourseTests,
  getUserTestResults,
  getTestProgressChartData
} from './testServices';
export * from './userProgressServices';
