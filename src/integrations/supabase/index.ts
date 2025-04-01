
// Export selective items from the client file to avoid duplicate exports
export { 
  supabase, 
  checkVipAccess
} from './client';
export type { VipStatus } from './client';

// Export everything from the service files
export * from './apiUtils';
export * from './courseServices';

// Export functions from testServices
export { 
  fetchCourseTests,
  fetchTestQuestions,
  saveTestResult, 
  getChapterTestProgress 
} from './testServices';

export * from './userProgressServices';
