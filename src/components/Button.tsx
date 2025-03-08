import React from 'react';

const ButtonVip = () => {
  return (
    <button
      className="
        relative
        px-6 py-3
        overflow-hidden
        font-medium
        transition-all
        bg-indigo-500
        rounded-md
        group
        text-white
        hover:bg-indigo-600
        card-footer 
        flex justify-center
      "
    >
      {/* Hiệu ứng 4 góc (tương tự ví dụ bạn đưa) */}
      <span className="absolute top-0 right-0 w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-mr-4 group-hover:-mt-4">
        <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white" />
      </span>
      <span className="absolute bottom-0 left-0 w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-ml-4 group-hover:-mb-4 rotate-180">
        <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white" />
      </span>

      {/* Text hiển thị trên nút */}
      <span className="relative z-10">
        Bắt đầu khóa học
      </span>
    </button>
  );
};

export default ButtonVip;
