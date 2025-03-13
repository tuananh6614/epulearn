
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Định nghĩa kiểu dữ liệu cho CourseCard
interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  chapters?: number;
  duration: string;
  category: string;
  image: string;
  color: string;
  isPremium?: boolean;
  price?: string | number;
  discountPrice?: string | number;
}

// Component hiển thị thẻ khóa học với thiết kế của Lovable
const CourseCard = ({ 
  id, 
  title, 
  description, 
  level, 
  chapters = 0, 
  duration, 
  category,
  image,
  color,
  isPremium = false,
  price,
  discountPrice
}: CourseCardProps) => {
  // Helper function to format price values
  const formatPrice = (price: string | number | undefined): string => {
    if (price === undefined) return '';
    if (typeof price === 'number') {
      return price.toLocaleString('vi-VN');
    }
    return price.toString();
  };

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
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Badge className="bg-white/90 text-gray-800 hover:bg-white/95 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:bg-gray-900/95 font-medium">
            {level}
          </Badge>
          
          {isPremium && (
            <Badge className="bg-yellow-500/90 text-white hover:bg-yellow-500/95 font-medium flex items-center gap-1">
              <Crown className="h-3 w-3" />
              VIP
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription>{category}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm mb-4 text-foreground/80">{description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          {chapters > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{chapters} chương</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>
        
        {isPremium && price && (
          <div className="mt-3 flex justify-between items-center">
            {discountPrice ? (
              <div className="flex flex-col">
                <span className="text-sm line-through text-muted-foreground">{formatPrice(price)}đ</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-500">{formatPrice(discountPrice)}đ</span>
              </div>
            ) : (
              <span className="text-lg font-semibold">{formatPrice(price)}đ</span>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Link to={`/course/${id}`} className="w-full">
          <Button variant="default" className={`w-full ${isPremium ? 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800' : ''}`}>
            {isPremium ? 'Xem Khóa Học VIP' : 'Xem Khóa Học'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
