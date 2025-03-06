
import React, { useEffect, useState } from 'react';

// Component hiển thị hiệu ứng gõ code
const CodeAnimation = () => {
  // State quản lý nội dung text hiển thị
  const [text, setText] = useState('');
  // State quản lý trạng thái hiển thị con trỏ
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // Đoạn code mẫu bằng tiếng Việt
  const codeSnippet = `// Chào mừng đến với EPU Learn
function hocLapTrinh() {
  const ngonNgu = [
    "Python", 
    "JavaScript", 
    "HTML/CSS",
    "Java",
    "C++"
  ];
  
  return ngonNgu.map(lang => {
    console.log(\`Đang học \${lang}...\`);
    return \`Đã thành thạo \${lang}!\`;
  });
}

// Bắt đầu hành trình học code
const ketQua = hocLapTrinh();
console.log("Sẵn sàng cho các thử thách!");`;

  // Effect tạo hiệu ứng đánh máy và nhấp nháy con trỏ
  useEffect(() => {
    let i = 0;
    // Hiệu ứng đánh máy từng chữ một
    const typingEffect = setInterval(() => {
      if (i < codeSnippet.length) {
        setText(codeSnippet.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, 50);

    // Hiệu ứng nhấp nháy con trỏ
    const cursorEffect = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

    // Cleanup khi component unmount
    return () => {
      clearInterval(typingEffect);
      clearInterval(cursorEffect);
    };
  }, []);

  return (
    <div className="code-container">
      <pre className="text-sm md:text-base">
        <code className="text-gray-100">
          {text}
          <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
        </code>
      </pre>
    </div>
  );
};

export default CodeAnimation;
