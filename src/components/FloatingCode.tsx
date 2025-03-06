
import React from 'react';

interface FloatingCodeProps {
  style?: React.CSSProperties;
}

const FloatingCode: React.FC<FloatingCodeProps> = ({ style }) => {
  return (
    <div
      className="absolute pointer-events-none select-none opacity-20 text-xs font-mono"
      style={{
        ...style,
        animation: `float 10s ease-in-out infinite, rotate-slow 20s linear infinite`,
      }}
    >
      <pre>
        {`
function helloWorld() {
  console.log("Hello, world!");
  return {
    message: "Welcome to EPU Learn!",
    status: 200,
    success: true
  };
}

const result = helloWorld();
        `}
      </pre>
    </div>
  );
};

export default FloatingCode;
