
import React, { useEffect, useState } from 'react';

// Component hiển thị hiệu ứng gõ code
const CodeAnimation = () => {
  // State quản lý nội dung text hiển thị
  const [text, setText] = useState('');
  // State quản lý trạng thái hiển thị con trỏ
  const [cursorVisible, setCursorVisible] = useState(true);
  // State quản lý hiệu ứng highlight
  const [highlightLine, setHighlightLine] = useState(-1);
  
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

  // Chuyển đổi đoạn văn thành mảng các dòng
  const codeLines = codeSnippet.split('\n');

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
        
        // Sau khi đánh máy xong, bắt đầu hiệu ứng highlight từng dòng
        let currentLine = 0;
        const highlightEffect = setInterval(() => {
          setHighlightLine(currentLine);
          currentLine = (currentLine + 1) % codeLines.length;
        }, 1500);
        
        return () => clearInterval(highlightEffect);
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

  // Hiển thị code với hiệu ứng highlight dòng
  const renderCodeWithHighlight = () => {
    // Nếu đang gõ, chỉ hiển thị text đã gõ
    if (text.length < codeSnippet.length) {
      return (
        <code className="text-green-400">
          {text}
          <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity text-orange-400`}>|</span>
        </code>
      );
    }
    
    // Hiển thị với highlight từng dòng
    return (
      <code>
        {codeLines.map((line, index) => {
          // Xác định màu sắc dựa trên nội dung dòng và trạng thái highlight
          let lineColor = 'text-green-400';
          
          if (index === highlightLine) {
            lineColor = 'text-white bg-green-800/30';
          } else if (line.includes('//')) {
            lineColor = 'text-gray-400';
          } else if (line.includes('function') || line.includes('const')) {
            lineColor = 'text-blue-400';
          } else if (line.includes('console.log')) {
            lineColor = 'text-yellow-400';
          }
          
          return (
            <div key={index} className={`${lineColor}`}>
              {line}
              {index === codeLines.length - 1 && (
                <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity text-orange-400`}>|</span>
              )}
            </div>
          );
        })}
      </code>
    );
  };

  return (
    <div className="code-container">
      <pre className="text-sm md:text-base">
        {renderCodeWithHighlight()}
      </pre>
    </div>
  );
};

export default CodeAnimation;
