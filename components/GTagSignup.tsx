// components/GTagSignup.tsx
"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const GTagSignup = () => {
  useEffect(() => {
    // Track Google Ads Signup conversion
    // Note: Google Ads only attributes this if user clicked an ad (has gclid cookie)
    // Google handles deduplication based on the ad click, so we just fire the event
    // TODO: Replace 'SIGNUP_LABEL' with your actual conversion label from Google Ads
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-11323828600/SIGNUP_LABEL'
      });
    }
  }, []);

  return null; // This component doesn't render anything
};

export default GTagSignup;

