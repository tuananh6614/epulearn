
import React, { useEffect, useRef } from 'react';

// Component tạo hiệu ứng mưa số rơi xuống
const NumberRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Lấy canvas element
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Lấy context để vẽ
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Thiết lập kích thước đầy đủ cho canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Gọi hàm resize khi component được mount
    resizeCanvas();
    
    // Lắng nghe sự kiện resize cửa sổ
    window.addEventListener('resize', resizeCanvas);
    
    // Mảng chứa các số đang rơi
    const fallingNumbers: {
      x: number;
      y: number;
      speed: number;
      value: string;
      opacity: number;
      size: number;
      color: string;
    }[] = [];
    
    // Tạo các số mới với tần suất ngẫu nhiên
    const createNumber = () => {
      // Các ký tự có thể rơi: số, các ký hiệu lập trình
      const possibleChars = "0123456789{}[]()<>=+-*/&|!?:;";
      const x = Math.random() * canvas.width;
      const speed = 1 + Math.random() * 3;
      const value = possibleChars[Math.floor(Math.random() * possibleChars.length)];
      const opacity = 0.1 + Math.random() * 0.5; // Giảm opacity để trông nhẹ nhàng hơn
      const size = 10 + Math.random() * 16;
      
      // Màu sắc ngẫu nhiên cho đa dạng hóa
      const colors = [
        'rgba(124, 179, 66, opacity)', // EPU green
        'rgba(58, 92, 155, opacity)',  // EPU blue
        'rgba(255, 165, 0, opacity)',  // Orange
        'rgba(143, 255, 159, opacity)' // Light green
      ];
      
      const color = colors[Math.floor(Math.random() * colors.length)].replace('opacity', opacity.toString());
      
      fallingNumbers.push({
        x,
        y: 0,
        speed,
        value,
        opacity,
        size,
        color
      });
    };
    
    // Vẽ và cập nhật các số
    const draw = () => {
      // Xóa canvas với độ trong suốt để tạo hiệu ứng mờ dần
      ctx.fillStyle = 'rgba(26, 32, 44, 0.05)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Vẽ lại từng số
      fallingNumbers.forEach((number, index) => {
        // Cập nhật vị trí
        number.y += number.speed;
        
        // Vẽ số
        ctx.font = `${number.size}px monospace`;
        ctx.fillStyle = number.color;
        ctx.fillText(number.value, number.x, number.y);
        
        // Thêm hiệu ứng sáng nhẹ
        ctx.shadowColor = number.color;
        ctx.shadowBlur = 5;
        
        // Xóa số nếu đã rơi khỏi canvas
        if (number.y > canvas.height) {
          fallingNumbers.splice(index, 1);
        }
      });
      
      // Thêm số mới với xác suất ngẫu nhiên
      if (Math.random() < 0.2) {
        createNumber();
      }
      
      // Tiếp tục vòng lặp animation
      requestAnimationFrame(draw);
    };
    
    // Bắt đầu animation
    draw();
    
    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
};

export default NumberRain;
