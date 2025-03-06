
import React, { useEffect, useState } from 'react';

const CodeAnimation = () => {
  const [text, setText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const codeSnippet = `// Welcome to EPU Learn
function learnToCode() {
  const languages = [
    "Python", 
    "JavaScript", 
    "HTML/CSS",
    "Java",
    "C++"
  ];
  
  return languages.map(lang => {
    console.log(\`Learning \${lang}...\`);
    return \`Mastered \${lang}!\`;
  });
}

// Start your coding journey
const results = learnToCode();
console.log("Ready for challenges!");`;

  useEffect(() => {
    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < codeSnippet.length) {
        setText(codeSnippet.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, 50);

    const cursorEffect = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

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
