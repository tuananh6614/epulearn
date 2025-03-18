
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BadgeCheck, Clock, Award, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  isPremium?: boolean;
  isEnrolled?: boolean;
  progress?: number;
  instructor?: string;
  duration?: string;
  level?: string;
  category?: string;
  colorOverride?: string;
  color?: string;
  price?: string | number;
  discountPrice?: string | number;
  small?: boolean;
  vipUnlocked?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  image,
  isPremium = false,
  isEnrolled = false,
  progress = 0,
  instructor,
  duration,
  level,
  category,
  colorOverride,
  color = 'blue',
  price,
  discountPrice,
  small = false,
  vipUnlocked = false
}) => {
  const bgColorClass = colorOverride || {
    'blue': 'bg-blue-500',
    'green': 'bg-green-500',
    'red': 'bg-red-500',
    'purple': 'bg-purple-500',
    'yellow': 'bg-yellow-500',
    'indigo': 'bg-indigo-500',
    'gray': 'bg-gray-500',
  }[color];

  const displayPrice = discountPrice || price;
  const hasDiscount = discountPrice && price && discountPrice !== price;

  return (
    <Card className="group overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl border-transparent hover:border-green-200 dark:hover:border-green-800">
      <Link to={`/course/${id}`} className="block relative overflow-hidden">
        <div className="overflow-hidden w-full aspect-video">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${bgColorClass} group-hover:w-2 transition-all duration-300`}></div>
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-2 right-2">
            <Badge className={`${bgColorClass} hover:${bgColorClass} transition-all duration-300 group-hover:scale-105`}>
              {category}
            </Badge>
          </div>
        )}
        
        {/* Progress overlay for enrolled courses */}
        {isEnrolled && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </Link>
      
      <CardContent className={`flex-grow ${small ? 'p-3' : 'p-4'}`}>
        <div className="mb-2 flex items-center gap-1">
          {level && (
            <Badge variant="outline" className="font-normal text-xs group-hover:border-green-500 transition-colors duration-300">
              {level}
            </Badge>
          )}
          
          {duration && (
            <Badge variant="outline" className="font-normal text-xs flex items-center gap-1 ml-1 group-hover:border-green-500 transition-colors duration-300">
              <Clock className="h-3 w-3" /> {duration}
            </Badge>
          )}
          
          {/* VIP Badge */}
          {isPremium && !vipUnlocked && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 ml-auto flex items-center gap-1 group-hover:bg-yellow-400 transition-colors duration-300">
              <Crown className="h-3 w-3" /> VIP
            </Badge>
          )}
          
          {/* VIP Unlocked Badge */}
          {vipUnlocked && (
            <Badge className="bg-green-500 hover:bg-green-600 ml-auto flex items-center gap-1 group-hover:bg-green-400 transition-colors duration-300">
              <Crown className="h-3 w-3" /> Đã mở khóa
            </Badge>
          )}
          
          {isEnrolled && progress >= 100 && (
            <Badge className="bg-green-500 hover:bg-green-600 ml-auto flex items-center gap-1 group-hover:bg-green-400 transition-colors duration-300">
              <BadgeCheck className="h-3 w-3" /> Hoàn thành
            </Badge>
          )}
        </div>
        
        <Link to={`/course/${id}`}>
          <h3 className={`font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors ${small ? 'text-base' : 'text-lg'} mb-1`}>
            {title}
          </h3>
        </Link>
        
        <p className={`text-gray-500 dark:text-gray-400 ${small ? 'text-xs' : 'text-sm'} line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300`}>
          {description}
        </p>
        
        {instructor && !small && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
            Giảng viên: {instructor}
          </p>
        )}
      </CardContent>
      
      <CardFooter className={`pt-0 ${small ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
        {(isPremium && !vipUnlocked && !isEnrolled) ? (
          <div className="w-full flex items-center justify-between">
            <div>
              {hasDiscount && (
                <span className="text-xs line-through text-gray-400 mr-1">
                  {typeof price === 'number' ? `${price.toLocaleString('vi-VN')}₫` : price}
                </span>
              )}
              <span className={`${hasDiscount ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'} font-bold group-hover:scale-105 transition-transform duration-300 inline-block`}>
                {typeof displayPrice === 'number' ? `${displayPrice.toLocaleString('vi-VN')}₫` : displayPrice}
              </span>
            </div>
            <Link to={`/course/${id}`}>
              <Button size="sm" variant="secondary" className="group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:text-green-700 dark:group-hover:text-green-400 transition-all duration-300">Xem thêm</Button>
            </Link>
          </div>
        ) : isEnrolled ? (
          <Link to={`/course/${id}`} className="w-full">
            <Button size="sm" className="w-full group-hover:bg-green-600 dark:group-hover:bg-green-600 group-hover:scale-[1.02] transition-all duration-300">
              {progress > 0 && progress < 100 ? 'Tiếp tục học' : 'Vào học'}
            </Button>
          </Link>
        ) : (
          <Link to={`/course/${id}`} className="w-full">
            <Button size="sm" variant="secondary" className="w-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:text-green-700 dark:group-hover:text-green-400 transition-all duration-300">
              {vipUnlocked ? 'Bắt đầu học' : 'Xem thêm'}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
