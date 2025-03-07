
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
    
    // Create subtle animated particles background (lovable style)
    createParticles(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const createParticles = (theme: 'light' | 'dark') => {
    // Clear existing particles
    const container = document.querySelector('.firefly-container') || document.createElement('div');
    if (!document.querySelector('.firefly-container')) {
      container.classList.add('firefly-container');
      document.body.appendChild(container);
    }
    container.innerHTML = '';
    
    // Number of particles
    const particleCount = 20;
    
    // Colors for particles based on theme
    const colors = theme === 'dark' 
      ? ['rgba(39, 128, 227, 0.8)', 'rgba(14, 165, 233, 0.8)'] 
      : ['rgba(39, 128, 227, 0.6)', 'rgba(14, 165, 233, 0.6)'];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('firefly');
      
      // Random size (3-7px)
      const size = Math.random() * 4 + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      
      // Random movement variables for the CSS animation
      const x = Math.random() * 200 - 100; // Move between -100px and 100px on X
      const y = Math.random() * 200 - 100; // Move between -100px and 100px on Y
      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      
      // Random animation duration and delay
      const duration = Math.random() * 6 + 6; // 6-12s duration
      const delay = Math.random() * 5; // 0-5s delay
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      
      // Random color from theme colors
      const colorIndex = Math.floor(Math.random() * colors.length);
      particle.style.backgroundColor = colors[colorIndex];
      
      // Add to container
      container.appendChild(particle);
    }
  };

  const toggleTheme = () => {
    setIsTransitioning(true);
    
    // Apply animation transition effect
    const overlay = document.createElement('div');
    overlay.classList.add('theme-transition-overlay');
    document.body.appendChild(overlay);
    
    // If we're switching to dark mode, use dark transition color
    if (!isDarkMode) {
      overlay.style.background = '#0D0F13';
    } else {
      overlay.style.background = '#ffffff';
    }
    
    // Start animation
    setTimeout(() => {
      overlay.classList.add('active');
      
      // Toggle theme with delay for animation
      setTimeout(() => {
        setIsDarkMode(!isDarkMode);
        
        // Remove overlay
        setTimeout(() => {
          setIsTransitioning(false);
          overlay.classList.remove('active');
          setTimeout(() => {
            document.body.removeChild(overlay);
          }, 500);
        }, 300);
      }, 300);
    }, 50);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="group w-10 h-10 p-0 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 overflow-hidden relative"
      onClick={toggleTheme}
      aria-label="Thay đổi chủ đề sáng tối"
      disabled={isTransitioning}
    >
      <span className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-blue-600 dark:from-blue-500 dark:to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
      <Sun className={`h-5 w-5 text-yellow-500 dark:text-white transition-all duration-500 ${isDarkMode ? 'opacity-0 scale-0 rotate-180 absolute' : 'opacity-100 scale-100 rotate-0'}`} />
      <Moon className={`h-5 w-5 text-blue-600 dark:text-blue-400 transition-all duration-500 ${isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-180 absolute'}`} />
      <span className="sr-only">Thay đổi chủ đề</span>
    </Button>
  );
};

export default ThemeToggle;
