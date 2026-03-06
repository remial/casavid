// components/RestoredImage.tsx
"use client"
import React from 'react';
import ReactCompareImage from 'react-compare-image';
import original from "/public/Living.png";
import restored from "/public/LivingX.png";

const RestoredImagemid: React.FC = () => {
  return (
    <div className="h-120 w-full">
          <ReactCompareImage 
            leftImage={original.src} 
            rightImage={restored.src} 
            leftImageLabel="Before"
            rightImageLabel="After"
            sliderLineColor = "green"
            sliderPositionPercentage = {0.3}
          />
        </div>
  );
};

export default RestoredImagemid;
