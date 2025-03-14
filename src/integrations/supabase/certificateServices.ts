
import { supabase } from './client';

/**
 * Generate a certificate for course completion
 * @param userId User ID
 * @param courseId Course ID
 * @returns Object containing success flag and certificate ID or error
 */
export const generateCertificate = async (userId: string, courseId: string) => {
  try {
    // Check if user has already been certified for this course
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (existingCert) {
      return { success: true, certificateId: existingCert.certificate_id, alreadyExists: true };
    }
    
    // Check if the user has completed the course (progress is at least 85%)
    const { data: courseProgress } = await supabase
      .from('user_courses')
      .select('progress_percentage')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (!courseProgress || courseProgress.progress_percentage < 85) {
      return { 
        success: false, 
        error: "Bạn cần hoàn thành ít nhất 85% khóa học để nhận chứng chỉ" 
      };
    }
    
    // Generate a certificate ID using the Supabase function
    const { data: certificateIdData, error: certIdError } = await supabase.rpc('generate_certificate_id');
    
    if (certIdError) {
      console.error('Error generating certificate ID:', certIdError);
      throw certIdError;
    }
    
    const certificateId = certificateIdData || `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Insert certificate record
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_id: certificateId,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
    
    return { success: true, certificateId: data.certificate_id };
  } catch (error) {
    console.error('Error in generateCertificate:', error);
    return { success: false, error };
  }
};

/**
 * Get a user's certificate for a specific course
 * @param userId User ID
 * @param courseId Course ID
 * @returns Certificate data or null
 */
export const getCertificate = async (userId: string, courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting certificate:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCertificate:', error);
    return null;
  }
};

/**
 * Get all certificates for a user
 * @param userId User ID
 * @returns Array of certificates
 */
export const getUserCertificates = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (
          id,
          title,
          thumbnail_url,
          category
        )
      `)
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });
      
    if (error) {
      console.error('Error getting user certificates:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserCertificates:', error);
    return [];
  }
};
