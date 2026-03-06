// components/RestoredImage.tsx
"use client"
import React from 'react';
import ReactCompareImage from 'react-compare-image';
import original from "/public/Living2.png";
import restored from "/public/Living2x.png";

const RestoredImage: React.FC = () => {
  return (
    <div className="h-full w-full">
          <ReactCompareImage 
            aspectRatio="taller"
            leftImage={original.src} 
            rightImage={restored.src} 
            leftImageLabel="Before"
            rightImageLabel="After"
            sliderLineColor = "green"
            sliderPositionPercentage = {0.3}
          />;
        </div>
  );
};

export default RestoredImage;
