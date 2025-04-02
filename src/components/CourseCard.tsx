
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock } from "lucide-react";

export interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  level?: string;
  duration?: string;
  category?: string;
  isPremium?: boolean;
  price?: string;
  discountPrice?: string;
  progress?: number;
  lastAccessed?: string;
  enrolledAt?: string;
  color?: string; // Added color property
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  image,
  level,
  duration,
  category,
  isPremium,
  price,
  discountPrice,
  progress,
  lastAccessed,
  enrolledAt,
  color,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <Link to={`/course/${id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {isPremium && (
            <Badge variant="default" className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600">
              VIP
            </Badge>
          )}
        </div>
      </Link>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          {category && (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          )}
          {level && (
            <Badge variant="secondary" className="text-xs">
              {level}
            </Badge>
          )}
        </div>
        <Link to={`/course/${id}`} className="block">
          <h3 className="font-bold text-lg line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {description}
        </p>
        
        {duration && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{duration}</span>
          </div>
        )}
        
        {lastAccessed && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>Truy cập lần cuối: {formatDate(lastAccessed)}</span>
          </div>
        )}
        
        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Tiến độ</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex items-center justify-between">
        {isPremium ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{discountPrice || price}</span>
            {discountPrice && (
              <span className="text-xs text-muted-foreground line-through">{price}</span>
            )}
          </div>
        ) : (
          <span className="text-sm font-medium">Miễn phí</span>
        )}
        
        <Link
          to={`/course/${id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {progress !== undefined ? "Tiếp tục" : "Chi tiết"}
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
