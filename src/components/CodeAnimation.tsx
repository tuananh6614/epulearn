
import React, { useEffect, useState, useRef } from 'react';

// Component hiển thị hiệu ứng gõ code với nhiều tính năng trực quan
const CodeAnimation = () => {
  // State quản lý nội dung text hiển thị
  const [text, setText] = useState('');
  // State quản lý trạng thái hiển thị con trỏ
  const [cursorVisible, setCursorVisible] = useState(true);
  // State quản lý hiệu ứng highlight
  const [highlightLine, setHighlightLine] = useState(-1);
  // State quản lý trạng thái đánh máy
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  // Ref cho container
  const codeContainerRef = useRef<HTMLDivElement>(null);
  
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
    // Hiệu ứng đánh máy từng chữ một với tốc độ không đều
    const typingEffect = setInterval(() => {
      if (i < codeSnippet.length) {
        // Thêm chút ngẫu nhiên vào tốc độ đánh máy để tạo cảm giác thực
        const isFastCharacter = Math.random() > 0.7;
        setText(codeSnippet.slice(0, i + 1));
        i++;
        
        // Nếu gặp dấu chấm câu hoặc kết thúc dòng, làm chậm lại
        if (codeSnippet[i] === '\n' || codeSnippet[i] === ';' || codeSnippet[i] === '.') {
          clearInterval(typingEffect);
          setTimeout(() => {
            const newTypingEffect = setInterval(() => {
              if (i < codeSnippet.length) {
                setText(codeSnippet.slice(0, i + 1));
                i++;
              } else {
                clearInterval(newTypingEffect);
                setIsTypingComplete(true);
              }
            }, 50);
            
            return () => clearInterval(newTypingEffect);
          }, 300);
        }
      } else {
        clearInterval(typingEffect);
        setIsTypingComplete(true);
        
        // Sau khi đánh máy xong, bắt đầu hiệu ứng highlight từng dòng
        let currentLine = 0;
        const highlightEffect = setInterval(() => {
          setHighlightLine(currentLine);
          currentLine = (currentLine + 1) % codeLines.length;
        }, 1500);
        
        return () => clearInterval(highlightEffect);
      }
    }, isFastTyping => isFastTyping ? 20 : 50);

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

  // Effect cho việc thêm click events
  useEffect(() => {
    if (isTypingComplete && codeContainerRef.current) {
      // Thêm hiệu ứng khi người dùng click vào code
      const container = codeContainerRef.current;
      
      const handleClick = (e: MouseEvent) => {
        // Tạo hiệu ứng làn sóng từ vị trí click
        const ripple = document.createElement('div');
        ripple.classList.add('absolute', 'bg-epu-green/30', 'rounded-full', 'pointer-events-none', 'animate-ping');
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        ripple.style.left = `${e.clientX - container.getBoundingClientRect().left - 25}px`;
        ripple.style.top = `${e.clientY - container.getBoundingClientRect().top - 25}px`;
        
        container.appendChild(ripple);
        
        // Xóa hiệu ứng sau 1 giây
        setTimeout(() => {
          ripple.remove();
        }, 1000);
      };
      
      container.addEventListener('click', handleClick);
      
      return () => {
        container.removeEventListener('click', handleClick);
      };
    }
  }, [isTypingComplete]);

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
            lineColor = 'text-white bg-green-800/30 px-2 -mx-2 rounded transition-colors duration-300';
          } else if (line.includes('//')) {
            lineColor = 'text-gray-400';
          } else if (line.includes('function') || line.includes('const')) {
            lineColor = 'text-blue-400';
          } else if (line.includes('console.log')) {
            lineColor = 'text-yellow-400';
          } else if (line.includes('return')) {
            lineColor = 'text-purple-400';
          } else if (line.includes('"') || line.includes('\'') || line.includes('`')) {
            // Đối với chuỗi, highlight với regex
            line = line.replace(/(['"`])(.*?)(['"`])/g, '<span class="text-orange-300">$1$2$3</span>');
            lineColor = '';
          }
          
          return (
            <div key={index} className={`${lineColor} group transition-transform duration-200 hover:scale-[1.02] cursor-pointer`}>
              <div dangerouslySetInnerHTML={{ __html: line }} />
              {index === codeLines.length - 1 && (
                <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity text-orange-400`}>|</span>
              )}
              
              {/* Thêm tooltip khi hover dòng */}
              {isTypingComplete && (
                <span className="absolute left-full ml-2 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {index === 0 ? 'Comment' : 
                   index === 1 ? 'Function declaration' :
                   index === 2 ? 'Variable declaration' :
                   index === 9 ? 'Arrow function' :
                   index === 10 ? 'Template string' :
                   index === 11 ? 'Return statement' :
                   index === 15 ? 'Comment' :
                   index === 16 ? 'Variable declaration' :
                   index === 17 ? 'Console output' : ''}
                </span>
              )}
            </div>
          );
        })}
      </code>
    );
  };

  return (
    <div className="code-container relative" ref={codeContainerRef}>
      <pre className="text-sm md:text-base relative z-10 cursor-text">
        {renderCodeWithHighlight()}
      </pre>
      
      {/* Thêm dòng số liệu giả bên trái */}
      <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col items-end pr-2 text-gray-600 text-xs opacity-60">
        {codeLines.map((_, index) => (
          <div key={index} className={`leading-6 ${index === highlightLine ? 'text-white' : ''}`}>
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeAnimation;
