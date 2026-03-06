import React from 'react';
import copy from '../public/copy.svg'
import Image from 'next/image'

type CaptionRowProps = {
  caption: string;
  number: number;
};

const CaptionRow: React.FC<CaptionRowProps> = ({ caption, number }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(caption);
  };

  return (
    <div>
      <div className="caption-row flex justify-start bg-white shadow-sm rounded-lg p-1 my-2">
      <span className="font-semibold text-lg text-left mr-4">{caption}</span>
      <button onClick={copyToClipboard} className="bg-white-100 hover:bg-blue-200 text-white font-bold py-4 px-4 rounded">
        {/*<img src={copy_icon} alt="Copy to clipboard" className="h-4 w-4" />*/}
        <Image src={copy} alt="Copy to clipboard" width={60} height={60} className="bg-black object-cover" />
      </button>
    </div>
    </div>
  );
};

export default CaptionRow;
