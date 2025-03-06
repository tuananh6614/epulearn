
import React, { useEffect, useRef } from 'react';

// Component tạo hiệu ứng mưa số rơi xuống với tính tương tác
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

    // Lưu vị trí chuột
    let mouseX = 0;
    let mouseY = 0;
    let isMouseActive = false;
    let mouseRadius = 100; // Bán kính ảnh hưởng của chuột

    // Lắng nghe sự kiện chuột
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseActive = true;
      
      // Tạo thêm số khi di chuyển chuột
      for (let i = 0; i < 3; i++) {
        createNumberAtPosition(mouseX, mouseY);
      }
      
      // Ẩn chuột sau 2 giây không di chuyển
      setTimeout(() => {
        isMouseActive = false;
      }, 2000);
    };

    const handleClick = (e: MouseEvent) => {
      // Tạo số khi click
      for (let i = 0; i < 15; i++) {
        createNumberAtPosition(e.clientX, e.clientY);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    // Mảng chứa các số đang rơi
    const fallingNumbers: {
      x: number;
      y: number;
      speed: number;
      value: string;
      opacity: number;
      size: number;
      color: string;
      rotationSpeed: number;
      rotation: number;
    }[] = [];
    
    // Tạo số ở vị trí cụ thể (cho tương tác chuột)
    const createNumberAtPosition = (x: number, y: number) => {
      // Các ký tự có thể rơi: số, các ký hiệu lập trình
      const possibleChars = "0123456789{}[]()<>=+-*/&|!?:;$#@%^";
      
      // Tạo vị trí ngẫu nhiên xung quanh con trỏ
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;
      
      const speed = 1 + Math.random() * 3;
      const value = possibleChars[Math.floor(Math.random() * possibleChars.length)];
      const opacity = 0.3 + Math.random() * 0.7;
      const size = 14 + Math.random() * 14;
      const rotationSpeed = (Math.random() - 0.5) * 0.1;
      const rotation = Math.random() * Math.PI * 2;
      
      // Màu sắc đa dạng
      const colors = [
        'rgba(124, 179, 66, opacity)',  // EPU green
        'rgba(58, 92, 155, opacity)',   // EPU blue
        'rgba(255, 165, 0, opacity)',   // Orange
        'rgba(143, 255, 159, opacity)', // Light green
        'rgba(255, 255, 255, opacity)', // White
        'rgba(102, 217, 232, opacity)', // Cyan
        'rgba(255, 105, 180, opacity)'  // Pink
      ];
      
      const color = colors[Math.floor(Math.random() * colors.length)].replace('opacity', opacity.toString());
      
      fallingNumbers.push({
        x: x + offsetX,
        y: y + offsetY,
        speed,
        value,
        opacity,
        size,
        color,
        rotationSpeed,
        rotation
      });
    };
    
    // Tạo các số mới với tần suất ngẫu nhiên
    const createNumber = () => {
      // Các ký tự có thể rơi: số, các ký hiệu lập trình
      const possibleChars = "0123456789{}[]()<>=+-*/&|!?:;$#@%^";
      const x = Math.random() * canvas.width;
      const speed = 1 + Math.random() * 3;
      const value = possibleChars[Math.floor(Math.random() * possibleChars.length)];
      const opacity = 0.2 + Math.random() * 0.5; // Giảm opacity để trông nhẹ nhàng hơn
      const size = 10 + Math.random() * 16;
      const rotationSpeed = (Math.random() - 0.5) * 0.05;
      const rotation = Math.random() * Math.PI * 2;
      
      // Màu sắc ngẫu nhiên cho đa dạng hóa
      const colors = [
        'rgba(124, 179, 66, opacity)',  // EPU green
        'rgba(58, 92, 155, opacity)',   // EPU blue
        'rgba(255, 165, 0, opacity)',   // Orange
        'rgba(143, 255, 159, opacity)', // Light green
        'rgba(255, 255, 255, opacity)', // White
        'rgba(102, 217, 232, opacity)', // Cyan
      ];
      
      const color = colors[Math.floor(Math.random() * colors.length)].replace('opacity', opacity.toString());
      
      fallingNumbers.push({
        x,
        y: 0,
        speed,
        value,
        opacity,
        size,
        color,
        rotationSpeed,
        rotation
      });
    };

    // Hàm giữ các số cách xa con trỏ chuột nếu chuột đang di chuyển
    const applyMouseInteraction = (number: any) => {
      if (!isMouseActive) return;
      
      // Tính khoảng cách từ số đến chuột
      const dx = number.x - mouseX;
      const dy = number.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Nếu số nằm trong phạm vi ảnh hưởng của chuột
      if (distance < mouseRadius) {
        // Tỉ lệ tác động
        const force = (mouseRadius - distance) / mouseRadius;
        
        // Di chuyển số ra xa chuột
        number.x += dx * force * 0.2;
        
        // Tăng kích thước và độ sáng khi gần chuột
        number.opacity = Math.min(1, number.opacity + force * 0.3);
        number.size = Math.min(30, number.size + force * 5);
      }
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
        number.rotation += number.rotationSpeed;
        
        // Tương tác với chuột
        applyMouseInteraction(number);
        
        // Lưu trạng thái context trước khi xoay
        ctx.save();
        
        // Di chuyển gốc tọa độ tới vị trí của số
        ctx.translate(number.x, number.y);
        
        // Xoay theo rotation
        ctx.rotate(number.rotation);
        
        // Vẽ số
        ctx.font = `${number.size}px monospace`;
        ctx.fillStyle = number.color;
        ctx.fillText(number.value, 0, 0);
        
        // Thêm hiệu ứng sáng nhẹ
        ctx.shadowColor = number.color;
        ctx.shadowBlur = 5;
        
        // Khôi phục trạng thái context
        ctx.restore();
        
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
};

export default NumberRain;
