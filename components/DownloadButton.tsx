// DownloadButton.tsx
import React from "react";
import { Button } from "./ui/button"; // Assuming this is your custom button component
import { Download } from "lucide-react";

interface DownloadButtonProps {
  onClick: () => void; // Define onClick as a function prop
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant={"destructive"}
      size="sm"
      onClick={onClick} // Use onClick prop here
      style={{ backgroundColor: 'lightblue', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 8px', borderRadius: '10px' }}
    >
      <Download style={{ marginRight: '2px' }} /> Download Document
    </Button>
  );
};

export default DownloadButton;
