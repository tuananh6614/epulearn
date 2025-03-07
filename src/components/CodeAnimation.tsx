
import React, { useEffect, useState } from 'react';

const CodeAnimation = () => {
  const [text, setText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  
  const codeSnippet = `// Simple code examples

// JavaScript
console.log("Hello World!");

// Python
print("Hello World!")

// HTML
<h1>Hello World!</h1>`;

  useEffect(() => {
    let i = 0;
    // Typing effect
    const typingEffect = setInterval(() => {
      if (i < codeSnippet.length) {
        setText(codeSnippet.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
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
            className="code-line px-2 py-1 rounded"
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
    </div>
  );
};

export default CodeAnimation;
