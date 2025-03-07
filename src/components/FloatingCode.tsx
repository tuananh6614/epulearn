
import React from 'react';

interface FloatingCodeProps {
  style?: React.CSSProperties;
  language?: 'javascript' | 'python' | 'html';
}

const FloatingCode: React.FC<FloatingCodeProps> = ({ style, language = 'javascript' }) => {
  // Adjust code snippet based on language
  const getCodeSnippet = () => {
    switch (language) {
      case 'python':
        return `
def xin_chao():
  print("Xin chào, thế giới!")
  return {
    "thong_diep": "EPU Learn!",
    "trang_thai": 200
  }`;
      case 'html':
        return `
<div class="container">
  <h1>EPU Learn</h1>
  <p>Học lập trình dễ dàng</p>
  <button>Bắt đầu</button>
</div>`;
      default:
        return `
function xinChao() {
  console.log("Xin chào!");
  return {
    thongDiep: "EPU Learn!",
    thanhCong: true
  };
}`;
    }
  };

  return (
    <div
      className="absolute pointer-events-none select-none opacity-20 text-xs font-mono hover:opacity-40 transition-opacity duration-300"
      style={{
        ...style,
        animation: `float 10s ease-in-out infinite, rotate-slow 20s linear infinite`,
      }}
    >
      <pre className="theme-code-block">
        {getCodeSnippet()}
      </pre>
    </div>
  );
};

export default FloatingCode;
