
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
    }[] = [];
    
    // Tạo các số mới với tần suất ngẫu nhiên
    const createNumber = () => {
      // Các ký tự có thể rơi: số, các ký hiệu lập trình
      const possibleChars = "0123456789{}[]()<>=+-*/&|!?:;";
      const x = Math.random() * canvas.width;
      const speed = 1 + Math.random() * 3;
      const value = possibleChars[Math.floor(Math.random() * possibleChars.length)];
      const opacity = 0.1 + Math.random() * 0.9;
      const size = 10 + Math.random() * 16;
      
      fallingNumbers.push({
        x,
        y: 0,
        speed,
        value,
        opacity,
        size
      });
    };
    
    // Vẽ và cập nhật các số
    const draw = () => {
      // Xóa canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Vẽ lại từng số
      fallingNumbers.forEach((number, index) => {
        // Cập nhật vị trí
        number.y += number.speed;
        
        // Vẽ số
        ctx.font = `${number.size}px monospace`;
        ctx.fillStyle = `rgba(124, 179, 66, ${number.opacity})`;
        ctx.fillText(number.value, number.x, number.y);
        
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
      style={{ opacity: 0.3 }}
    />
  );
};

export default NumberRain;
