// Filename: ConversionTracking.tsx

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any) => void;
  }
}

const GTagEvent: React.FC = () => {
  useEffect(() => {
    // Define the gtag function as per Google's gtag documentation
    // This ensures typescript knows about the gtag function.
    interface Gtag {
      (command: 'event', action: string, params: { [key: string]: any }): void;
    }

    // Check if gtag is available on the window object
    const gtag: Gtag | undefined = window.gtag;

    if (gtag) {
      gtag('event', 'conversion', {
        'send_to': 'AW-11323828600/UMKLCKKNiJQZEPjSz5cq',
      });
    } else {
      console.error('gtag not found');
    }
  }, []);

  return null; // This component does not render anything
};

export default GTagEvent;

