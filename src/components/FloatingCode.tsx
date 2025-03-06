
import React from 'react';

// Định nghĩa kiểu dữ liệu cho props
interface FloatingCodeProps {
  style?: React.CSSProperties;
  variant?: 'default' | 'javascript' | 'python' | 'html';
}

// Component hiển thị đoạn code nổi với animation
const FloatingCode: React.FC<FloatingCodeProps> = ({ style, variant = 'default' }) => {
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

  return (
    <div
      className={`absolute pointer-events-none select-none opacity-20 text-xs font-mono ${getColor()}`}
      style={{
        ...style,
        animation: `float 10s ease-in-out infinite, rotate-slow 20s linear infinite`,
      }}
    >
      <pre>
        {codeSnippets[variant]}
      </pre>
    </div>
  );
};

export default FloatingCode;
