import Image from "next/image";
import React from "react";
import gif from "../public/msgzr4.gif"

const InfoVideo: React.FC = () => {
  return (
    <div className="flex justify-center items-center border-4 border-purple-200 rounded-sm">
   
    <Image
    src={gif.src}
    height={1500}
    width={1500}    
    alt="myStoryGen description"
    className="rounded-lg object-cover"
    
  />
</div>
  );
};

export default InfoVideo;

