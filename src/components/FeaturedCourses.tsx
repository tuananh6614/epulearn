
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CourseCard from './CourseCard';
import { Link } from "react-router-dom";

const featuredCourses = [
  {
    id: "html-basics",
    title: "HTML Essentials",
    description: "Learn the fundamentals of HTML to create structured web pages",
    level: "Beginner",
    chapters: 8,
    duration: "4 weeks",
    category: "Web Development",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #48BB78 0%, #38A169 100%)"
  },
  {
    id: "css-basics",
    title: "CSS Essentials",
    description: "Master CSS styling to create beautiful web designs",
    level: "Beginner",
    chapters: 10,
    duration: "5 weeks",
    category: "Web Development",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #4299E1 0%, #3182CE 100%)"
  },
  {
    id: "js-basics",
    title: "JavaScript Fundamentals",
    description: "Build interactive web applications with JavaScript",
    level: "Intermediate",
    chapters: 12,
    duration: "6 weeks",
    category: "Programming",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #ECC94B 0%, #D69E2E 100%)"
  },
  {
    id: "python-basics",
    title: "Python Essentials",
    description: "Get started with Python programming for beginners",
    level: "Beginner",
    chapters: 10,
    duration: "5 weeks",
    category: "Programming",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #667EEA 0%, #764BA2 100%)"
  }
];

const FeaturedCourses = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <div>
            <h2 className="text-3xl font-bold text-epu-dark mb-2">Featured Courses</h2>
            <p className="text-gray-600 max-w-2xl">Explore our most popular programming courses and start your coding journey today.</p>
          </div>
          <Button variant="link" className="text-epu-blue" asChild>
            <Link to="/courses" className="flex items-center">
              View all courses <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
