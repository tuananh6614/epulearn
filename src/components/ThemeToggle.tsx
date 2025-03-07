
import React, { useEffect, useState, useRef } from 'react';
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
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);
  const lightOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      
      // Create fireflies if they don't exist
      if (document.querySelectorAll('.firefly').length === 0) {
        createFireflies();
      }
      
      // Remove light mode particles
      document.querySelectorAll('.particle-light').forEach(el => el.remove());
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      
      // Remove fireflies
      document.querySelectorAll('.firefly').forEach(el => el.remove());
      
      // Create light mode particles
      createLightParticles();
    }
  }, [isDarkMode]);

  const createFireflies = () => {
    const fireflyContainer = document.querySelector('.firefly-container') || 
      document.createElement('div');
    
    if (!document.querySelector('.firefly-container')) {
      fireflyContainer.classList.add('firefly-container');
      document.body.appendChild(fireflyContainer);
    }
    
    // Clear existing fireflies
    fireflyContainer.innerHTML = '';
    
    // Create new fireflies - increased count and brightness
    for (let i = 0; i < 100; i++) {
      const firefly = document.createElement('div');
      firefly.classList.add('firefly');
      
      // Random size (larger)
      const size = Math.random() * 8 + 4; // 4-12px size
      firefly.style.width = `${size}px`;
      firefly.style.height = `${size}px`;
      
      // Random position
      firefly.style.left = `${Math.random() * 100}vw`;
      firefly.style.top = `${Math.random() * 100}vh`;
      
      // Random animation properties
      const x = Math.random() * 400 - 200;
      const y = Math.random() * 400 - 200;
      firefly.style.setProperty('--x', `${x}px`);
      firefly.style.setProperty('--y', `${y}px`);
      
      // Random duration and delay
      const duration = Math.random() * 6 + 4;
      const delay = Math.random() * 5;
      firefly.style.animationDuration = `${duration}s`;
      firefly.style.animationDelay = `${delay}s`;
      
      // Higher brightness
      const brightness = Math.random() * 0.6 + 0.8; // 0.8 to 1.4
      firefly.style.opacity = brightness.toString();
      
      // Add to container
      fireflyContainer.appendChild(firefly);
    }
  };
  
  const createLightParticles = () => {
    const particleContainer = document.querySelector('.particle-container') || 
      document.createElement('div');
    
    if (!document.querySelector('.particle-container')) {
      particleContainer.classList.add('particle-container', 'fixed', 'inset-0', 'pointer-events-none', 'z-0', 'overflow-hidden');
      document.body.appendChild(particleContainer);
    }
    
    // Clear existing particles
    particleContainer.innerHTML = '';
    
    // Create floating colorful particles for light mode
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle-light');
      
      // Random size
      const size = Math.random() * 20 + 10;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      
      // Random colors
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 50) + 50;
      const lightness = Math.floor(Math.random() * 20) + 70;
      particle.style.backgroundColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`;
      
      // Random blur and shape
      const blur = Math.random() * 5 + 2;
      particle.style.filter = `blur(${blur}px)`;
      const borderRadius = Math.random() * 50 + 50;
      particle.style.borderRadius = `${borderRadius}%`;
      
      // Random rotation and animation
      const rotationStart = Math.random() * 360;
      particle.style.setProperty('--rotation-start', `${rotationStart}deg`);
      const rotationEnd = rotationStart + (Math.random() * 180 - 90);
      particle.style.setProperty('--rotation-end', `${rotationEnd}deg`);
      
      // Random animation duration
      const duration = Math.random() * 20 + 15;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      
      // Add to container
      particleContainer.appendChild(particle);
    }
  };

  const toggleTheme = (e: React.MouseEvent) => {
    setIsTransitioning(true);
    
    // Get clicked position for animation origin
    const rect = toggleButtonRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);
    
    // Prepare the overlay for the animation
    const overlay = isDarkMode ? lightOverlayRef.current : darkOverlayRef.current;
    if (overlay) {
      overlay.style.setProperty('--x', `${x}px`);
      overlay.style.setProperty('--y', `${y}px`);
      overlay.classList.add('active');
    }
    
    // Toggle theme after a short delay for animation
    setTimeout(() => {
      setIsDarkMode(!isDarkMode);
      
      // Remove the active class after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
        if (overlay) {
          overlay.classList.remove('active');
        }
        
        // Create fireflies if switching to dark mode
        if (!isDarkMode) {
          createFireflies();
        } else {
          createLightParticles();
        }
      }, 800);
    }, 400);
  };

  return (
    <>
      <Button 
        ref={toggleButtonRef}
        variant="outline" 
        size="icon" 
        className={`relative overflow-hidden group theme-toggle ${isTransitioning ? 'theme-transitioning' : ''}`}
        onClick={toggleTheme}
        aria-label="Thay đổi chủ đề sáng tối"
      >
        <span className="sr-only">Thay đổi chủ đề</span>
        <Sun className={`h-5 w-5 transition-all ${isDarkMode ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0 sun-icon'}`} />
        <Moon className={`absolute h-5 w-5 transition-all ${isDarkMode ? 'scale-100 opacity-100 rotate-0 moon-icon' : 'scale-0 opacity-0 rotate-90'}`} />
        
        {/* Ripple effect */}
        <span className="absolute inset-0 w-full h-full bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300"></span>
        
        {/* Theme switch animation */}
        <span className={`absolute inset-0 bg-gradient-to-tr ${isDarkMode ? 'from-indigo-900 to-purple-700' : 'from-yellow-300 to-orange-400'} rounded-full scale-0 opacity-0 group-active:scale-100 group-active:opacity-60 transition-all duration-500`}></span>
      </Button>
      
      {/* Theme transition overlays */}
      <div 
        ref={darkOverlayRef} 
        className="dark-transition-overlay fixed inset-0 z-[9999] pointer-events-none"
        style={{ 
          animationName: 'dark-fragments-in',
          animationDuration: '0.8s',
          animationFillMode: 'forwards',
          animationTimingFunction: 'ease-in-out',
          animationPlayState: 'paused',
          opacity: 0
        }}
      ></div>
      
      <div 
        ref={lightOverlayRef} 
        className="light-transition-overlay fixed inset-0 z-[9999] pointer-events-none"
        style={{ 
          animationName: 'light-fragments-out',
          animationDuration: '0.8s',
          animationFillMode: 'forwards',
          animationTimingFunction: 'ease-in-out',
          animationPlayState: 'paused',
          opacity: 0
        }}
      ></div>
    </>
  );
};

export default ThemeToggle;
