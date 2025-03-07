
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

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="relative overflow-hidden group"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label="Thay đổi chủ đề sáng tối"
    >
      <span className="sr-only">Thay đổi chủ đề</span>
      <Sun className={`h-5 w-5 transition-all ${isDarkMode ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
      <Moon className={`absolute h-5 w-5 transition-all ${isDarkMode ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
      
      {/* Ripple effect */}
      <span className="absolute inset-0 w-full h-full bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300"></span>
    </Button>
  );
};

export default ThemeToggle;
