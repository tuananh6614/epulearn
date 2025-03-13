
// Export everything from the client file
export * from './client';

// Export everything from the service files
export * from './apiUtils';
export * from './courseServices';
export * from './testServices';
export * from './userProgressServices';

// Export the supabase client for direct usage
export { supabase } from './client';
