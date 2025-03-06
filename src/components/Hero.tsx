
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';
import CodeAnimation from './CodeAnimation';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-12 md:py-24">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-float absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-epu-green/5"></div>
        <div className="animate-float animation-delay-1000 absolute bottom-1/4 right-1/6 w-96 h-96 rounded-full bg-epu-blue/5"></div>
        <div className="animate-pulse-light absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-epu-green/10"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="typewriter mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-epu-dark leading-tight mb-4 inline-block">
                Learn coding <span className="text-epu-green">interactively</span>
              </h1>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Master programming languages through interactive lessons and test your knowledge after each chapter. Turn learning into an adventure!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-epu-green hover:bg-epu-green/90 text-white px-6 py-6 rounded-md text-lg" asChild>
                <Link to="/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" className="border-epu-blue text-epu-blue hover:bg-epu-blue/10 px-6 py-6 rounded-md text-lg" asChild>
                <Link to="/demo">Try Demo Lesson</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="pt-8 px-6 pb-6 bg-gray-900 text-white font-mono">
                <CodeAnimation />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-epu-green/20 rounded-full blur-xl animate-pulse-light"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-epu-blue/20 rounded-full blur-xl animate-pulse-light animation-delay-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
