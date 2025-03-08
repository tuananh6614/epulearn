
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Buttonvip from "./Button";

// Định nghĩa kiểu dữ liệu cho CourseCard
interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  chapters: number;
  duration: string;
  category: string;
  image: string;
  color: string;
}

// Component hiển thị thẻ khóa học với thiết kế của Lovable
const CourseCard = ({ 
  id, 
  title, 
  description, 
  level, 
  chapters, 
  duration, 
  category,
  image,
  color 
}: CourseCardProps) => {
  return (
    <Card className="course-card h-full overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-500 bg-card dark:bg-card/60 hover:-translate-y-2">
      <div 
        className="card-img h-44 w-full relative overflow-hidden" 
        style={{ 
          background: color,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-500">
          <img 
            src={image} 
            alt={title} 
            className="object-cover h-full w-full opacity-90 transition-all duration-500 hover:opacity-100" 
          />
        </div>
        <div className="absolute top-2 right-2">
          <Badge className="bg-white/90 text-gray-800 hover:bg-white/95 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:bg-gray-900/95 font-medium">
            {level}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription>{category}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm mb-4 text-foreground/80">{description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{chapters} chương</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Link to={`/course/${id}`} className="w-full flex justify-center">
          <Buttonvip />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
