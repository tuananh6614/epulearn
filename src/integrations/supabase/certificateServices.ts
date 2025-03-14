
import { supabase } from './client';
import type { Json } from './types';

// Function to generate a certificate for a user completing a course
export const generateCertificate = async (userId: string, courseId: string, courseName: string) => {
  try {
    // Check if certificate already exists
    const { data: existingCert, error: checkError } = await supabase
      .from('certificates')
      .select('id, certificate_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing certificate:', checkError);
      throw checkError;
    }
    
    // If certificate already exists, return it
    if (existingCert) {
      console.log('Certificate already exists:', existingCert);
      return existingCert;
    }
    
    // Generate a certificate ID using a function or fallback to random ID
    let certificateId: string;
    
    try {
      // Explicitly type the result of the RPC call
      const { data, error: certIdError } = await supabase
        .rpc('generate_certificate_id');
        
      if (certIdError) {
        throw certIdError;
      }
      
      // Ensure data is treated as a string
      certificateId = String(data);
    } catch (error) {
      console.error('Error generating certificate ID via RPC, using fallback:', error);
      certificateId = `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }
    
    // Insert certificate record
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_id: certificateId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
    
    console.log('Certificate generated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in generateCertificate:', error);
    throw error;
  }
};

// Function to get user certificates
export const getUserCertificates = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (
          title,
          description,
          category,
          level
        )
      `)
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching user certificates:', error);
      throw error;
    }
    
    return data?.map(cert => ({
      id: cert.id,
      userId: cert.user_id,
      courseId: cert.course_id,
      certificateId: cert.certificate_id,
      issueDate: cert.issue_date,
      courseName: cert.courses?.title || 'Unknown Course'
    })) || [];
  } catch (error) {
    console.error('Error in getUserCertificates:', error);
    return [];
  }
};

// Function to get a single certificate
export const getCertificate = async (certificateId: string) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (
          title,
          description,
          category,
          level,
          instructor
        ),
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('certificate_id', certificateId)
      .single();
    
    if (error) {
      console.error('Error fetching certificate:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCertificate:', error);
    return null;
  }
};
