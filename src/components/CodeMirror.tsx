
import React, { useEffect, useRef } from 'react';

interface CodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  theme?: 'light' | 'dark';
  lang?: string;
}

const CodeMirror: React.FC<CodeMirrorProps> = ({ 
  value, 
  onChange, 
  height = "200px", 
  theme = "light", 
  lang = "html" 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lineNumbers = value.split('\n').length;
  
  useEffect(() => {
    // Create line numbers
    const updateLineNumbers = () => {
      if (editorRef.current) {
        const textArea = editorRef.current.querySelector('textarea');
        if (textArea) {
          const lines = textArea.value.split('\n').length;
          const gutter = editorRef.current.querySelector('.editor-gutter');
          if (gutter) {
            gutter.innerHTML = Array(lines).fill(0).map((_, i) => 
              `<div class="editor-line-number">${i + 1}</div>`
            ).join('');
          }
        }
      }
    };
    
    updateLineNumbers();
  }, [value]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      // Add tab
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Move cursor position
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };
  
  const getLanguageClass = () => {
    switch (lang) {
      case 'html':
        return 'language-html';
      case 'css':
        return 'language-css';
      case 'javascript':
        return 'language-javascript';
      case 'jsx':
        return 'language-jsx';
      case 'typescript':
        return 'language-typescript';
      case 'python':
        return 'language-python';
      default:
        return 'language-html';
    }
  };
  
  return (
    <div 
      ref={editorRef}
      className={`code-editor-container border rounded-md overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
      style={{ height }}
    >
      <div className="editor-header flex items-center px-4 py-2 border-b">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-xs opacity-70">{lang.toUpperCase()}</div>
      </div>
      
      <div className="editor-body flex">
        <div className="editor-gutter px-2 py-1 text-right text-gray-500 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 select-none">
          {Array(lineNumbers).fill(0).map((_, i) => (
            <div key={i} className="editor-line-number">{i + 1}</div>
          ))}
        </div>
        
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full h-full p-1 outline-none resize-none font-mono text-sm ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'} ${getLanguageClass()}`}
          spellCheck="false"
          style={{ minHeight: "calc(100% - 36px)" }}
        />
      </div>
    </div>
  );
};

export default CodeMirror;
