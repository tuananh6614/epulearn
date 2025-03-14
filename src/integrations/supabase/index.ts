
// Export selective items from the client file to avoid duplicate exports
export { 
  supabase, 
  checkVipAccess,
  VipStatus 
} from './client';

// Export everything from the service files
export * from './apiUtils';
export * from './courseServices';

// Similar to client.ts, selectively export from testServices to avoid duplicates
export { 
  fetchTestQuestions, 
  saveTestResult, 
  getChapterTestProgress 
} from './testServices';
export * from './userProgressServices';
