import React from 'react';

const sizeMap = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-12 h-12 border-4",
  xl: "w-16 h-16 border-4",
};

const Spinner = ({ size = "md", color = "text-indigo-500", fullScreen = false }) => {
  const ring = (
    <div
      className={`
        ${sizeMap[size]}
        ${color}
        rounded-full
        border-current
        border-t-transparent
        animate-spin
      `}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          {ring}
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return ring;
};

export default Spinner;
