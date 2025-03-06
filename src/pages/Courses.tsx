
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from 'lucide-react';

const coursesData = [
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
  },
  {
    id: "java-basics",
    title: "Java Fundamentals",
    description: "Learn object-oriented programming with Java",
    level: "Beginner",
    chapters: 12,
    duration: "6 weeks",
    category: "Programming",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #F56565 0%, #E53E3E 100%)"
  },
  {
    id: "cpp-basics",
    title: "C++ Essentials",
    description: "Master C++ programming language fundamentals",
    level: "Intermediate",
    chapters: 14,
    duration: "7 weeks",
    category: "Programming",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #9F7AEA 0%, #805AD5 100%)"
  },
  {
    id: "react-basics",
    title: "React.js Fundamentals",
    description: "Build modern user interfaces with React",
    level: "Intermediate",
    chapters: 12,
    duration: "6 weeks",
    category: "Web Development",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #4FD1C5 0%, #38B2AC 100%)"
  },
  {
    id: "node-basics",
    title: "Node.js Basics",
    description: "Create server-side applications with Node.js",
    level: "Intermediate",
    chapters: 10,
    duration: "5 weeks",
    category: "Backend Development",
    image: "/placeholder.svg",
    color: "linear-gradient(90deg, #68D391 0%, #48BB78 100%)"
  }
];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  
  const filteredCourses = coursesData.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || course.category === categoryFilter;
    const matchesLevel = levelFilter === '' || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });
  
  const categories = [...new Set(coursesData.map(course => course.category))];
  const levels = [...new Set(coursesData.map(course => course.level))];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="bg-epu-dark text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">Explore Our Courses</h1>
            <p className="text-gray-300 max-w-3xl">
              Discover a wide range of programming courses designed to take you from beginner to expert. Each course includes interactive lessons and chapter quizzes.
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-10">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(categoryFilter || levelFilter || searchTerm) && (
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setLevelFilter('');
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
