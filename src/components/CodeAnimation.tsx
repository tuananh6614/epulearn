
import React, { useEffect, useState } from 'react';

const CodeAnimation = () => {
  const [text, setText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [lineHighlight, setLineHighlight] = useState(-1);
  
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

  const lines = codeSnippet.split('\n');

  useEffect(() => {
    let i = 0;
    // Hiệu ứng đánh máy từng chữ một
    const typingEffect = setInterval(() => {
      if (i < codeSnippet.length) {
        setText(codeSnippet.slice(0, i + 1));
        i++;
        
        // Highlight current line
        const currentLineIndex = codeSnippet.slice(0, i).split('\n').length - 1;
        setLineHighlight(currentLineIndex);
      } else {
        clearInterval(typingEffect);
        
        // After typing is done, cycle through line highlights
        let lineIndex = 0;
        const cycleHighlight = setInterval(() => {
          setLineHighlight(lineIndex % lines.length);
          lineIndex++;
        }, 2000);
        
        return () => clearInterval(cycleHighlight);
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
        {text.split('\n').map((line, index) => (
          <div 
            key={index} 
            className={`code-line ${lineHighlight === index ? 'highlighted-line' : ''}`}
          >
            {line}
            {index === text.split('\n').length - 1 && (
              <span className={`cursor ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
            )}
          </div>
        ))}
      </pre>
    </div>
  );
};

export default CodeAnimation;
