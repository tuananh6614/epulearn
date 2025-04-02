
/**
 * User Progress Services
 * 
 * Mock implementation for user progress tracking functionality
 */

import { supabase } from './client';

// Get user progress for a specific lesson
export const getLessonProgress = async (userId: string, lessonId: string | number) => {
  console.log(`[MOCK] Getting progress for lesson: ${lessonId}, user: ${userId}`);
  
  // Return mock data
  return {
    completed: Math.random() > 0.5,
    progress_percentage: Math.floor(Math.random() * 100),
    last_position: Math.floor(Math.random() * 100),
    updated_at: new Date().toISOString()
  };
};

// Save user progress for a lesson
export const saveLessonProgress = async (
  userId: string, 
  courseId: string | number,
  chapterId: string | number,
  lessonId: string | number,
  progress: number = 100
) => {
  console.log(`[MOCK] Saving progress for lesson: ${lessonId}, user: ${userId}, progress: ${progress}%`);
  
  // Return success response
  return {
    success: true,
    error: null
  };
};

// Get lesson pages
export const getLessonPages = async (lessonId: string | number) => {
  console.log(`[MOCK] Getting pages for lesson: ${lessonId}`);
  
  // Return mock pages data
  return {
    success: true,
    pages: [
      { id: 1, title: "Introduction", content: "This is the introduction page" },
      { id: 2, title: "Main Content", content: "This is the main content page" },
      { id: 3, title: "Summary", content: "This is the summary page" }
    ],
    error: null
  };
};

export default {
  getLessonProgress,
  saveLessonProgress,
  getLessonPages
};
