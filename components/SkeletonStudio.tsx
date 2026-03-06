import React from 'react';

const SkeletonStudio: React.FC = () => {
  return (
    <div className="animate-pulse flex justify-center items-center h-96 w-96 px-6">
      <div className="relative rounded-xl bg-gray-300 h-full w-full flex flex-col justify-center items-center">
        <div className="absolute h-10 w-10 border-4 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
        <p className="absolute bottom-4 text-center text-gray-700 text-sm px-4">
          
        </p>
      </div>
    </div>
  );
};

export default SkeletonStudio;
