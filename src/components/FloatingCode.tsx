
import React from 'react';

interface FloatingCodeProps {
  style?: React.CSSProperties;
  language?: 'javascript' | 'python' | 'html';
}

const FloatingCode: React.FC<FloatingCodeProps> = ({ style, language = 'javascript' }) => {
  // Simplified code snippet based on language
  const getCodeSnippet = () => {
    switch (language) {
      case 'python':
        return `
print("Hello World!")`;
      case 'html':
        return `
<h1>Hello World!</h1>`;
      default:
        return `
console.log("Hello World!");`;
    }
  };

  return (
    <div
      className="absolute pointer-events-none select-none opacity-20 text-xs font-mono hover:opacity-60 dark:hover:opacity-70 transition-all duration-300 group"
      style={{
        ...style,
        animation: `float 10s ease-in-out infinite, rotate-slow 20s linear infinite`,
      }}
    >
      <pre className="theme-code-block dark:bg-gray-800/80 bg-gray-100/90 backdrop-blur-sm group-hover:backdrop-blur-md transition-all p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <code className="language-code text-gray-800 dark:text-gray-200">
          {getCodeSnippet().split('\n').map((line, i) => (
            <div key={i} className="code-line">
              <span className="line-number">{i > 0 ? i : ''}</span>
              {line}
            </div>
          ))}
        </code>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/10 via-transparent to-transparent dark:from-primary/30 rounded transition-opacity duration-500"></div>
      </pre>
    </div>
  );
};

export default FloatingCode;
