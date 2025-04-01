import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import CourseCard from '@/components/CourseCard';
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { fetchVipCourses } from '@/integrations/supabase/apiUtils';
import { Course } from '@/models/lesson';
import { Loader2 } from "lucide-react";
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const VipCourses = () => {
  const [vipCourses, setVipCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadVipCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const coursesData = await fetchVipCourses();
        setVipCourses(coursesData);
      } catch (err) {
        console.error('Error fetching VIP courses:', err);
        setError('Failed to load VIP courses');
        toast.error('Failed to load VIP courses');
      } finally {
        setIsLoading(false);
      }
    };

    loadVipCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div>
          <h2 className="text-2xl font-bold mb-4">Không thể tải khóa học VIP</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      <div className="container max-w-6xl py-8">
        <h1 className="text-3xl font-bold mb-6">Khóa Học VIP</h1>
        {currentUser?.isVip ? (
          <>
            <p className="text-gray-500 mb-4">
              Chào mừng bạn đến với các khóa học VIP của chúng tôi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vipCourses.map((course) => (
                <div key={String(course.id)} className="relative group">
                  <CourseCard
                    id={String(course.id)}
                    title={course.title}
                    description={course.description}
                    image={course.image || course.thumbnail_url || '/placeholder.svg'}
                    level={course.level}
                    duration={course.duration}
                    isPremium={true}
                    price={course.price}
                    discountPrice={course.discountPrice || course.discount_price}
                    category={course.category}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-8">
              Bạn cần nâng cấp lên tài khoản VIP để truy cập các khóa học này.
            </p>
            <Button asChild>
              <Link to="/pricing">Nâng cấp VIP</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VipCourses;
