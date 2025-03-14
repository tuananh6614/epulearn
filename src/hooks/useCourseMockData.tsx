
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createSampleCourseContent } from '@/integrations/supabase/courseServices';

// This hook is simplified to only maintain the data fetching functionality
// without exposing the content generation features in the UI
export const useCourseMockData = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);
  const [premiumCourses, setPremiumCourses] = useState<any[]>([]);
  
  // Fetch all premium courses
  const fetchPremiumCourses = async () => {
    try {
      setIsFetchingCourses(true);
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_premium', true);
        
      if (error) throw error;
      
      setPremiumCourses(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching premium courses:', error);
      toast.error('Không thể tải danh sách khóa học cao cấp');
      return [];
    } finally {
      setIsFetchingCourses(false);
    }
  };
  
  // The content generation function is kept but not exposed in the UI
  // This can be used via direct Supabase access as per user's preference
  const generateMockContent = async () => {
    try {
      setIsGenerating(true);
      
      // First get all premium courses
      const courses = await fetchPremiumCourses();
      
      if (!courses || courses.length === 0) {
        toast.error('Không có khóa học cao cấp để tạo nội dung');
        return false;
      }
      
      // For each course, generate sample content
      let successCount = 0;
      
      for (const course of courses) {
        // Check if course already has content
        const { count, error: countError } = await supabase
          .from('chapters')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', course.id);
          
        if (countError) {
          console.error(`Error checking content for course ${course.id}:`, countError);
          continue;
        }
        
        // Skip if course already has content
        if (count && count > 0) {
          console.log(`Course ${course.id} already has content, skipping`);
          successCount++;
          continue;
        }
        
        // Generate sample content
        const result = await createSampleCourseContent(course.id);
        
        if (result.success) {
          successCount++;
        }
      }
      
      if (successCount === 0) {
        toast.error('Không thể tạo nội dung mẫu cho bất kỳ khóa học nào');
        return false;
      } else if (successCount < courses.length) {
        toast.success(`Đã tạo nội dung mẫu cho ${successCount}/${courses.length} khóa học`);
      } else {
        toast.success('Đã tạo nội dung mẫu cho tất cả khóa học cao cấp');
      }
      
      return true;
    } catch (error) {
      console.error('Error generating mock content:', error);
      toast.error('Không thể tạo nội dung mẫu cho khóa học');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // We only return the fetch function as the generate function will be used via Supabase
  return {
    isFetchingCourses,
    premiumCourses,
    fetchPremiumCourses,
    // Still return these properties for backward compatibility, but they won't be used in the UI
    isGenerating,
    generateMockContent
  };
};
