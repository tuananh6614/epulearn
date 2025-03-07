
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsDarkMode(!isDarkMode);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 100);
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={`relative overflow-hidden group theme-toggle ${isTransitioning ? 'theme-transitioning' : ''}`}
      onClick={toggleTheme}
      aria-label="Thay đổi chủ đề sáng tối"
    >
      <span className="sr-only">Thay đổi chủ đề</span>
      <Sun className={`h-5 w-5 transition-all ${isDarkMode ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'}`} />
      <Moon className={`absolute h-5 w-5 transition-all ${isDarkMode ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-90'}`} />
      
      {/* Ripple effect */}
      <span className="absolute inset-0 w-full h-full bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300"></span>
      
      {/* Theme switch animation */}
      <span className={`absolute inset-0 bg-gradient-to-tr ${isDarkMode ? 'from-indigo-900 to-purple-700' : 'from-yellow-300 to-orange-400'} rounded-full scale-0 opacity-0 group-active:scale-100 group-active:opacity-60 transition-all duration-500`}></span>
    </Button>
  );
};

export default ThemeToggle;
