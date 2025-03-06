
import React, { useState, useEffect } from 'react';

// Định nghĩa kiểu dữ liệu cho props
interface FloatingCodeProps {
  style?: React.CSSProperties;
  variant?: 'default' | 'javascript' | 'python' | 'html';
}

// Component hiển thị đoạn code nổi với animation và tương tác
const FloatingCode: React.FC<FloatingCodeProps> = ({ style, variant = 'default' }) => {
  // State theo dõi hover
  const [isHovered, setIsHovered] = useState(false);
  // State theo dõi vị trí chuột
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // State theo dõi hiệu ứng nhấp nháy
  const [isGlowing, setIsGlowing] = useState(false);

  // Effect cho hiệu ứng nhấp nháy ngẫu nhiên
  useEffect(() => {
    // Hiệu ứng nhấp nháy định kỳ
    const glowInterval = setInterval(() => {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 500);
    }, Math.random() * 5000 + 5000); // 5-10 giây một lần

    return () => clearInterval(glowInterval);
  }, []);

  // Các mẫu code cho các ngôn ngữ khác nhau
  const codeSnippets = {
    default: `
function xinChao() {
  console.log("Xin chào, thế giới!");
  return {
    thongDiep: "Chào mừng đến với EPU Learn!",
    trangThai: 200,
    thanhCong: true
  };
}

const ketQua = xinChao();
    `,
    javascript: `
// JavaScript modern
const hocVien = {
  ten: "Nguyễn Văn A",
  tuoi: 22,
  khoaHoc: ["JavaScript", "React", "Node.js"]
};

const { ten, khoaHoc } = hocVien;
khoaHoc.forEach(kh => {
  console.log(\`\${ten} đang học \${kh}\`);
});
    `,
    python: `
# Python code
def tinh_diem_trung_binh(diem_list):
    tong = sum(diem_list)
    so_mon = len(diem_list)
    return tong / so_mon

diem_cac_mon = [8.5, 9.0, 7.5, 10.0]
diem_tb = tinh_diem_trung_binh(diem_cac_mon)
print(f"Điểm trung bình: {diem_tb}")
    `,
    html: `
<!-- HTML/CSS -->
<div class="card">
  <h2 class="title">Bài Học HTML</h2>
  <p class="content">
    HTML là ngôn ngữ đánh dấu
    siêu văn bản cơ bản
  </p>
  <button class="btn">Bắt đầu học</button>
</div>
    `
  };

  // Chọn màu cho từng ngôn ngữ
  const getColor = () => {
    switch (variant) {
      case 'javascript':
        return 'text-yellow-400';
      case 'python':
        return 'text-blue-400';
      case 'html':
        return 'text-orange-400';
      default:
        return 'text-green-400';
    }
  };

  // Xử lý sự kiện hover
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Theo dõi vị trí chuột khi hover
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isHovered) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <div
      className={`absolute select-none ${getColor()} transition-all duration-300`}
      style={{
        ...style,
        opacity: isHovered ? 0.6 : 0.2,
        filter: `blur(${isHovered ? '0px' : '1px'})`,
        transform: `${style?.transform || ''} scale(${isHovered ? 1.05 : 1})`,
        animation: isGlowing 
          ? 'pulse 0.5s ease-in-out' 
          : `float 10s ease-in-out infinite, rotate-slow 20s linear infinite`,
        cursor: 'pointer',
        zIndex: isHovered ? 2 : 0
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Hiệu ứng glow theo vị trí chuột */}
      {isHovered && (
        <div 
          className="absolute rounded-full bg-current opacity-20 blur-xl pointer-events-none transition-all duration-300"
          style={{
            width: '80px',
            height: '80px',
            left: `${mousePosition.x - 40}px`,
            top: `${mousePosition.y - 40}px`,
            zIndex: -1
          }}
        />
      )}
      
      <pre className="font-mono text-xs">
        {codeSnippets[variant]}
      </pre>
    </div>
  );
};

export default FloatingCode;
