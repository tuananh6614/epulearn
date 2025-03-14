
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { SupabaseCourseResponse } from '@/models/lesson';

interface RegularCourseCardProps {
  course: SupabaseCourseResponse;
}

const RegularCourseCard: React.FC<RegularCourseCardProps> = ({ course }) => {
  const categoryColor = {
    JavaScript: 'yellow',
    React: 'blue',
    Node: 'green',
    Backend: 'purple',
    Database: 'red',
    General: 'gray'
  }[course.category] || 'blue';

  return (
    <Card className="overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`bg-${categoryColor}-500 h-2`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="border-gray-300">
            {course.level}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1 inline" />
            <span className="font-inter">{course.duration}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-montserrat font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2 font-inter">{course.description}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-600 font-inter">{course.category}</span>
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

export default RegularCourseCard;
