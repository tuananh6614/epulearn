
import React, { useEffect, useRef, useState } from 'react';

interface NumberRainProps {
  density?: number;
  speed?: number;
  characters?: string;
  color?: string;
  interactive?: boolean;
}

const NumberRain: React.FC<NumberRainProps> = ({
  density = 50,
  speed = 1.5,
  characters = "01",
  color = "var(--digital-rain-color, #7cb342)",
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const requestRef = useRef<number>();
  const columnsRef = useRef<any[]>([]);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  
  // Use Intersection Observer to only animate when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    
    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }
    
    return () => {
      if (canvasRef.current) {
        observer.unobserve(canvasRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
    };
    
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Resize handler to maintain full-screen canvas
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Regenerate columns when resizing
        initColumns();
      }
    };
    
    // Initialize columns
    const initColumns = () => {
      // Clear previous columns
      columnsRef.current = [];
      
      // Calculate columns based on density
      const fontSize = 14;
      const columnsCount = Math.ceil(canvas.width / fontSize) * (density / 100);
      
      for (let i = 0; i < columnsCount; i++) {
        const x = i * fontSize + Math.random() * fontSize;
        const columnSpeed = speed * (0.8 + Math.random() * 0.4); // Random speed variation
        
        columnsRef.current.push({
          x,
          speed: columnSpeed,
          fontSize,
          drops: Array.from({ length: Math.floor(Math.random() * 15) + 5 }, 
                           () => -Math.floor(Math.random() * canvas.height)),
          text: Array.from({ length: Math.floor(Math.random() * 15) + 5 }, 
                          () => characters.charAt(Math.floor(Math.random() * characters.length)))
        });
      }
    };
    
    // Animation function with performance optimizations
    const draw = () => {
      if (!isVisible || !ctx) {
        return;
      }
      
      // Use semi-transparent rect instead of fillRect for better performance
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw columns
      columnsRef.current.forEach(column => {
        let opacity = 1;
        
        if (interactive) {
          // Calculate distance from mouse
          const distance = Math.hypot(column.x - mouseXRef.current, column.drops[0] - mouseYRef.current);
          const maxDistance = 200; // Max distance for interaction
          
          if (distance < maxDistance) {
            // Move away from cursor
            const repelFactor = 1 - (distance / maxDistance);
            column.speed = speed * (1 + repelFactor);
            opacity = 0.3 + (0.7 * (distance / maxDistance));
          } else {
            column.speed = speed;
            opacity = 1;
          }
        }
        
        ctx.fillStyle = color;
        ctx.font = `${column.fontSize}px monospace`;
        
        for (let i = 0; i < column.drops.length; i++) {
          // Randomize characters occasionally (reduced frequency for performance)
          if (Math.random() > 0.99) {
            column.text[i] = characters.charAt(Math.floor(Math.random() * characters.length));
          }
          
          // First character is brighter
          const individualOpacity = i === 0 ? 1 : (1 - i / column.drops.length) * 0.8;
          ctx.globalAlpha = individualOpacity * opacity;
          
          // Draw character
          ctx.fillText(
            column.text[i],
            column.x,
            column.drops[i]
          );
          
          // Move drop
          column.drops[i] += column.speed;
          
          // Reset drop if it's offscreen
          if (column.drops[i] > canvas.height) {
            column.drops[i] = 0;
            column.text[i] = characters.charAt(Math.floor(Math.random() * characters.length));
          }
        }
      });
      
      // Reset global alpha
      ctx.globalAlpha = 1;
    };
    
    // Animation loop with performance throttling
    let lastFrame = 0;
    const targetFPS = 30; // Lower FPS for better performance
    const frameInterval = 1000 / targetFPS;
    
    const animate = (timestamp: number) => {
      if (!lastFrame || timestamp - lastFrame >= frameInterval) {
        lastFrame = timestamp;
        draw();
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Initialize and start the animation
    handleResize();
    window.addEventListener('resize', handleResize);
    
    if (isVisible) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [density, speed, characters, color, interactive, isVisible]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    />
  );
};

export default React.memo(NumberRain);
