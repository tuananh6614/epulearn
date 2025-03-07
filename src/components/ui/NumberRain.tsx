
import React, { useEffect, useRef } from 'react';

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
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;
    
    // Resize handler to maintain full-screen canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initial sizing
    handleResize();
    window.addEventListener('resize', handleResize);

    // Track mouse position for interactive effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Create the matrix effect
    class Column {
      x: number;
      speed: number;
      fontSize: number;
      text: string;
      private drops: number[];
      
      constructor(x: number, speed: number, fontSize: number) {
        this.x = x;
        this.speed = speed;
        this.fontSize = fontSize;
        this.drops = [];
        this.text = '';
        
        // Generate initial drops
        const length = Math.floor(Math.random() * 15) + 5;
        for (let i = 0; i < length; i++) {
          this.drops.push(-Math.floor(Math.random() * canvas.height));
        }
        
        // Generate random text for this column
        this.generateText();
      }
      
      generateText() {
        this.text = '';
        for (let i = 0; i < this.drops.length; i++) {
          this.text += characters.charAt(Math.floor(Math.random() * characters.length));
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        let opacity = 1;
        
        if (interactive) {
          // Calculate distance from mouse
          const distance = Math.sqrt(Math.pow(this.x - mouseX, 2) + Math.pow(this.drops[0] - mouseY, 2));
          const maxDistance = 200; // Max distance for interaction
          
          if (distance < maxDistance) {
            // Move away from cursor
            const repelFactor = 1 - (distance / maxDistance);
            this.speed = speed * (1 + repelFactor);
            opacity = 0.3 + (0.7 * (distance / maxDistance));
          } else {
            this.speed = speed;
            opacity = 1;
          }
        }
        
        ctx.fillStyle = color;
        ctx.font = `${this.fontSize}px monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
          // Randomize characters sometimes
          if (Math.random() > 0.98) {
            this.text = this.text.substring(0, i) + 
                        characters.charAt(Math.floor(Math.random() * characters.length)) + 
                        this.text.substring(i + 1);
          }
          
          // First character is brighter
          const individualOpacity = i === 0 ? 1 : (1 - i / this.drops.length) * 0.8;
          ctx.globalAlpha = individualOpacity * opacity;
          
          ctx.fillText(
            this.text[i],
            this.x,
            this.drops[i]
          );
          
          // Move drop
          this.drops[i] += this.speed;
          
          // Reset drop if it's offscreen
          if (this.drops[i] > canvas.height) {
            this.drops[i] = 0;
            // Generate new character
            this.text = this.text.substring(0, i) + 
                        characters.charAt(Math.floor(Math.random() * characters.length)) + 
                        this.text.substring(i + 1);
          }
        }
        
        ctx.globalAlpha = 1;
      }
    }
    
    // Calculate columns based on density
    const fontSize = 14;
    const columns = [];
    const columnsCount = Math.ceil(canvas.width / fontSize) * (density / 100);
    
    for (let i = 0; i < columnsCount; i++) {
      const x = i * fontSize + Math.random() * fontSize;
      const columnSpeed = speed * (0.8 + Math.random() * 0.4); // Random speed variation
      columns.push(new Column(x, columnSpeed, fontSize));
    }
    
    // Animation loop
    const animate = () => {
      // Semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      columns.forEach(column => column.draw(ctx));
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, speed, characters, color, interactive]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
    />
  );
};

export default NumberRain;