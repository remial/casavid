import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const CountdownContinue: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const countdownStart = 9;
  const [countdown, setCountdown] = useState(countdownStart);
  const [progressSections, setProgressSections] = useState(0); // Number of filled sections
  const totalSections = 5; // Total sections in the progress bar
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownTimer);
          onClose();
        }
        return prevCountdown - 1;
      });
    }, 2000);

    // Progress bar logic
    const updateProgress = (sectionsToAdd: any, delay: any) => {
      setTimeout(() => {
        setProgressSections((prevSections) => Math.min(prevSections + sectionsToAdd, totalSections-2));
      }, delay);
    };

    const delays = [1000, 3000, 5000, 8000]; // Delays for each update in milliseconds
    const sectionsToAdd = [3, 2, 2, 2,]; // Sections to add at each update

    delays.forEach((delay, index) => updateProgress(sectionsToAdd[index], delay));

    return () => {
      clearInterval(countdownTimer);
    };
  }, [onClose]);

  useEffect(() => {
    if (countdown <= 0) {
      onClose();
    }
  }, [countdown, onClose]);

  if (!hasMounted) {
    return null;
  }

  const progressPercent = (progressSections / totalSections) * 100;

  return (
    <Dialog open={countdown > 0}>
      <DialogContent className="bg-white">
        <DialogTitle className="text-center text-green-600">Great choice! Your Adventure continues in...</DialogTitle>
        {/* Progress bar */}
        <div className="my-2 bg-gray-200 rounded-full h-2.5">
          <div
            style={{ width: `${progressPercent}%` }}
            className="bg-green-600 h-2.5 rounded-full"
          ></div>
        </div>
        <div className="flex text-bold text-green-800 justify-center items-center p-4">
          00:{countdown < 10 ? `0${countdown}` : countdown}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CountdownContinue;
