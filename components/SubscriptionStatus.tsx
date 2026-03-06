"use client"
// SubscriptionStatus.tsx
import React, { useState, useEffect } from 'react';
import { getUserSubscriptionPlan } from '@/lib/stripe'

interface SubscriptionStatusProps {
  session: any; // Adjust the type according to your actual session object
}

// This is a Client Component because it uses React hooks (useState, useEffect).
export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ session }) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<string>('Loading...');

  useEffect(() => {
    // Assume getUserSubscriptionPlan is accessible and can be called here
    async function fetchSubscriptionInfo() {
      // Fetch subscription data and update state
      const info = await getUserSubscriptionPlan();
      setSubscriptionInfo(info.isSubscribed ? 'Subscribed' : 'Not Subscribed');
    }

    fetchSubscriptionInfo();
  }, [session]);

  return <span>{subscriptionInfo}</span>;
};
