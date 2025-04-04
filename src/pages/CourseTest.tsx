import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseTest, saveTestResult } from '@/services/testServices';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CourseTestForm from '@/components/CourseTestForm';
import { toast } from 'sonner';
import { api as supabase } from '@/integrations/api/client';

const CourseTest = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingResult, setSubmittingResult] = useState(false);
  
  useEffect(() => {
    const fetchTest = async () => {
      if (!courseId || !user) {
        navigate('/courses');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch test data
        const testData = await fetchCourseTest(courseId);
        
        if (!testData) {
          toast.error('Không tìm thấy bài kiểm tra cho khóa học này');
          navigate(`/course/${courseId}`);
          return;
        }
        
        setTest(testData);
        
        // Get course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();
          
        if (courseData) {
          setCourseName(courseData.title);
        }
      } catch (error) {
        console.error('Error fetching test:', error);
        toast.error('Không thể tải bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTest();
  }, [courseId, user, navigate]);
  
  const handleTestComplete = async (score: number, passed: boolean) => {
    if (!user || !courseId || !test) return;
    
    try {
      setSubmittingResult(true);
      
      // Save test result
      const result = await saveTestResult({
        user_id: user.id,
        course_id: courseId,
        course_test_id: test.id,
        score,
        passed,
        time_taken: (test.time_limit * 60) - 100, // Just a sample calculation
        created_at: new Date().toISOString()
      });
      
      if (result) {
        toast.success('Đã lưu kết quả bài kiểm tra');
      }
      
    } catch (error) {
      console.error('Error saving test result:', error);
      toast.error('Không thể lưu kết quả bài kiểm tra');
    } finally {
      setSubmittingResult(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-20 max-w-4xl flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-20 pb-10 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate(`/course/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại khóa học
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Bài kiểm tra tổng kết</h2>
            <p className="text-muted-foreground text-sm">{courseName}</p>
          </div>
        </div>
        
        {test && (
          <CourseTestForm 
            test={test} 
            courseId={courseId || ''}
            onComplete={handleTestComplete}
          />
        )}
      </div>
    </div>
  );
};

export default CourseTest;
