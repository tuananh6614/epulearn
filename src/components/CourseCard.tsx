
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";

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
    <Card className="course-card overflow-hidden border border-gray-200 transition-all hover:shadow-md">
      <div 
        className="h-40 w-full" 
        style={{ 
          background: color,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={image} 
            alt={title} 
            className="object-cover h-full w-full opacity-80" 
          />
        </div>
        <div className="absolute top-2 right-2">
          <Badge className="bg-white/90 text-gray-800 hover:bg-white/95">{level}</Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl text-epu-dark">{title}</CardTitle>
        <CardDescription className="text-gray-600">{category}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <BookOpen className="h-4 w-4" />
            <span>{chapters} chapters</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full bg-epu-blue hover:bg-epu-blue/90" asChild>
          <Link to={`/course/${id}`}>
            Start Learning <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
