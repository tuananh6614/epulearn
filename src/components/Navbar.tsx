
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, BookOpen, GraduationCap, Home } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-epu-green to-epu-blue">
              <Code className="h-4 w-4 text-white" />
            </div>
            <span className="text-epu-dark">EPU<span className="text-epu-green">Learn</span></span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link to="/courses" className="text-sm font-medium flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground">
            <BookOpen className="h-4 w-4" />
            Courses
          </Link>
          <Link to="/certification" className="text-sm font-medium flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground">
            <GraduationCap className="h-4 w-4" />
            Certification
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" className="bg-epu-green hover:bg-epu-green/90" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
