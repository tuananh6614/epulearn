
import React, { useEffect, useRef } from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // Movement speed factor (negative values move in opposite direction)
  className?: string;
}

const ParallaxEffect: React.FC<ParallaxProps> = ({ 
  children, 
  speed = 0.5, 
  className = ''
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parallaxElement = elementRef.current;
    if (!parallaxElement) return;

    let ticking = false;
    let lastScrollY = window.scrollY;

    const updatePosition = () => {
      if (!parallaxElement) return;
      
      const yPos = lastScrollY * speed;
      parallaxElement.style.transform = `translate3d(0, ${yPos}px, 0)`;
      
      ticking = false;
    };

    const onScroll = () => {
      lastScrollY = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(updatePosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return (
    <div ref={elementRef} className={`parallax-element ${className}`}>
      {children}
    </div>
  );
};

export default ParallaxEffect;
