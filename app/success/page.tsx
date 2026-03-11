// pages/success.tsx
"use client"

import MetaPix from "@/components/MetaPix";
import Link from "next/link";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { track } from '@vercel/analytics';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    datafast?: (...args: any[]) => void;
  }
}


const Success: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [shouldTrackMeta, setShouldTrackMeta] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number | null>(null);
  const [purchaseCurrency, setPurchaseCurrency] = useState<string>('USD');

  useEffect(() => {
    // Set confetti dimensions only after component mounts on client side
    setDimensions({ width: window.innerWidth, height: window.innerHeight });

    const timer = setTimeout(() => setShowConfetti(false), 5000); // Stops after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Track purchase goal with DataFast
    if (typeof window !== 'undefined' && window.datafast) {
      const planName = sessionStorage.getItem('datafast_purchase_plan') || 'unknown';
      const billingPeriod = sessionStorage.getItem('datafast_purchase_billing') || 'monthly';
      
      window.datafast('purchase', {
        plan_name: planName.toLowerCase().replace(' ', '_'),
        billing_period: billingPeriod,
      });
      
      // Clear the stored data after tracking
      sessionStorage.removeItem('datafast_purchase_plan');
      sessionStorage.removeItem('datafast_purchase_billing');
    }
  }, []);

  useEffect(() => {
    // Check if this is a legitimate redirect from Stripe (for Meta/Snap pixels only)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (!sessionId) {
      setShouldTrackMeta(false);
      return;
    }

    // Check if we've already tracked this session_id
    const trackedSessionsKey = 'tracked_stripe_sessions';
    let trackedSessions: string[] = [];
    try {
      trackedSessions = JSON.parse(localStorage.getItem(trackedSessionsKey) || '[]');
      if (!Array.isArray(trackedSessions)) {
        trackedSessions = [];
      }
    } catch (e) {
      console.warn("Failed to parse tracked sessions, resetting");
      trackedSessions = [];
    }
    
    if (trackedSessions.includes(sessionId)) {
      setShouldTrackMeta(false);
      return;
    }

    // Mark this session_id as tracked
    trackedSessions.push(sessionId);
    if (trackedSessions.length > 100) {
      trackedSessions.shift();
    }
    localStorage.setItem(trackedSessionsKey, JSON.stringify(trackedSessions));
    
    // Fetch the actual purchase amount from Stripe
    const fetchPurchaseAmount = async () => {
      try {
        const response = await fetch(`/api/get-checkout-amount?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.success && data.amount > 0) {
          setPurchaseAmount(data.amount);
          setPurchaseCurrency(data.currency || 'USD');
        } else {
          // Fallback: try to get amount from sessionStorage
          const storedAmount = sessionStorage.getItem('meta_purchase_amount');
          if (storedAmount) {
            setPurchaseAmount(parseFloat(storedAmount));
            sessionStorage.removeItem('meta_purchase_amount');
          }
        }
      } catch (error) {
        console.error('Error fetching purchase amount:', error);
        // Fallback: try to get amount from sessionStorage
        const storedAmount = sessionStorage.getItem('meta_purchase_amount');
        if (storedAmount) {
          setPurchaseAmount(parseFloat(storedAmount));
          sessionStorage.removeItem('meta_purchase_amount');
        }
      }
    };
    
    fetchPurchaseAmount();
    setShouldTrackMeta(true);

    // Track Vercel Analytics Purchase event
    track('Purchase');

    // Track Google Ads Purchase conversion
    // TODO: Replace 'PURCHASE_LABEL' with your actual conversion label from Google Ads
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-11323828600/PURCHASE_LABEL'
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen py-6 px-4 bg-gray-50 text-center relative">
      {/* Only fire Meta/Snap pixels on legitimate purchases from Stripe (prevents duplicate tracking on back button) */}
      {shouldTrackMeta && purchaseAmount !== null && (
        <MetaPix event="Purchase" value={purchaseAmount} currency={purchaseCurrency} />
      )}
      
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          numberOfPieces={150}
          gravity={0.2}
          wind={0.01}
          colors={["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"]}
          recycle={false}
          initialVelocityX={5}
          initialVelocityY={5}
        />
      )}
      
      <div className="mt-12">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Subscription Successful! 🎉
        </h1>
        <p className="text-lg text-gray-800">
          Please visit the{" "}
          <Link href="/dashboard" className="text-blue-600 underline hover:text-blue-800">
            Dashboard
          </Link>{" "}
          to continue.
        </p>
      </div>
    </div>
  );
};

export default Success;
