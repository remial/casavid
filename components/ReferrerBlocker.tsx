// components/ReferrerBlocker.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ReferrerBlocker({ children }: { children: React.ReactNode }) {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const ref = document.referrer.toLowerCase();
    if (ref.includes('clifton3u')) {
      //console.log('Blocked bot traffic from referrer: clifton3u');
      setIsBlocked(true);
    }
  }, []);

  if (isBlocked) {
    return null;
  }

  return <>{children}</>;
}
