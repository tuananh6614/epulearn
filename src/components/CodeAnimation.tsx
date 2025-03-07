
import React, { useEffect, useState, useCallback } from 'react';

const CodeAnimation = () => {
  const [text, setText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [lineHighlight, setLineHighlight] = useState(-1);
  const [userInteraction, setUserInteraction] = useState(false);
  
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

  // Handle line click
  const handleLineClick = useCallback((index: number) => {
    setUserInteraction(true);
    setLineHighlight(index);
  }, []);

  // Reset user interaction flag after some time
  useEffect(() => {
    if (userInteraction) {
      const timer = setTimeout(() => {
        setUserInteraction(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [userInteraction]);

  useEffect(() => {
    let i = 0;
    // Typing effect
    const typingEffect = setInterval(() => {
      if (i < codeSnippet.length) {
        setText(codeSnippet.slice(0, i + 1));
        i++;
        
        // Highlight current line
        const currentLineIndex = codeSnippet.slice(0, i).split('\n').length - 1;
        setLineHighlight(currentLineIndex);
      } else {
        clearInterval(typingEffect);
        
        // After typing is done, cycle through line highlights if no user interaction
        let lineIndex = 0;
        const cycleHighlight = setInterval(() => {
          if (!userInteraction) {
            setLineHighlight(lineIndex % lines.length);
            lineIndex++;
          }
        }, 2000);
        
        return () => clearInterval(cycleHighlight);
      }
    }, 50);

    // Cursor blinking effect
    const cursorEffect = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

    // Cleanup on unmount
    return () => {
      clearInterval(typingEffect);
      clearInterval(cursorEffect);
    };
  }, []);

  return (
    <div className="code-container relative">
      <pre className="text-sm md:text-base overflow-x-auto">
        {text.split('\n').map((line, index) => (
          <div 
            key={index} 
            className={`code-line ${lineHighlight === index ? 'highlighted-line' : ''} hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer transition-colors px-2 py-1 rounded`}
            onClick={() => handleLineClick(index)}
          >
            <span className="line-number text-gray-500 dark:text-gray-400 select-none mr-3">{index + 1}</span>
            <span className="line-content">
              {line}
              {index === text.split('\n').length - 1 && (
                <span className={`cursor ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity dark:text-epu-green text-epu-blue`}>|</span>
              )}
            </span>
          </div>
        ))}
      </pre>
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 italic">Nhấp vào dòng để highlight</div>
    </div>
  );
};

export default CodeAnimation;
