
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { CrownIcon, Clock, ChevronRight } from 'lucide-react';
import { SupabaseCourseResponse } from '@/models/lesson';

interface VipCourseCardProps {
  course: SupabaseCourseResponse;
}

const VipCourseCard: React.FC<VipCourseCardProps> = ({ course }) => {
  return (
    <Card className="pricing-card overflow-hidden border-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2"></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">VIP</Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1 inline" />
            <span className="font-inter">{course.duration}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-montserrat font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2 font-inter">{course.description}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <CrownIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="font-montserrat font-bold text-amber-600">Khóa học VIP</span>
          </div>
          <Link to={`/courses/${course.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            Chi tiết
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default VipCourseCard;
