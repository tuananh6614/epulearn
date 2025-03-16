
import React, { useEffect, useRef } from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

const ParallaxEffect: React.FC<ParallaxProps> = ({ 
  children, 
  speed = 0.5, 
  className = ''
}) => {
  // Simply return the children without any parallax effect
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

export default ParallaxEffect;
