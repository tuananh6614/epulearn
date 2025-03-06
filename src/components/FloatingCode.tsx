
import React from 'react';

// Định nghĩa kiểu dữ liệu cho props
interface FloatingCodeProps {
  style?: React.CSSProperties;
}

// Component hiển thị đoạn code nổi với animation
const FloatingCode: React.FC<FloatingCodeProps> = ({ style }) => {
  return (
    <div
      className="absolute pointer-events-none select-none opacity-20 text-xs font-mono text-green-400"
      style={{
        ...style,
        animation: `float 10s ease-in-out infinite, rotate-slow 20s linear infinite`,
      }}
    >
      <pre>
        {`
function xinChao() {
  console.log("Xin chào, thế giới!");
  return {
    thongDiep: "Chào mừng đến với EPU Learn!",
    trangThai: 200,
    thanhCong: true
  };
}

const ketQua = xinChao();
        `}
      </pre>
    </div>
  );
};

export default FloatingCode;
