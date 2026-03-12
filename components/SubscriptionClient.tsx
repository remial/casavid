"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Loader2 } from "lucide-react";

const SubscriptionClient = () => {
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsCreatingPortal(true);
      const response = await axios.post("/api/create-portal-session");
      if (response.data?.url) {
        // User has subscription - redirect to Stripe portal
        window.location.href = response.data.url;
      } else if (response.data?.redirectTo) {
        // User has no subscription - redirect to pricing page
        window.location.href = response.data.redirectTo;
      } else {
        alert("Error creating customer portal session. Please try again.");
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      alert("Error accessing customer portal. Please try again.");
    } finally {
      setIsCreatingPortal(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Subscription Information</h1>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-600 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Price Increase Coming Soon
            </h3>
            <div className="text-sm text-yellow-700">
              <p>
                We'll be increasing our pricing soon. Don't worry your current plan will be 
                grandfathered at its existing rate as long as your subscription remains active. 
                If you cancel, it means the videos will be deleted, you'll lose your grandfathered pricing and future renewals will 
                be at the new rate.
              </p>
            </div>
          </div>
        </div>
      </div>

     

      {/* Back to Dashboard Button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Manage Subscription Link */}
      <div>
        <button
          onClick={handleManageSubscription}
          disabled={isCreatingPortal}
          className="text-gray-500 text-sm hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingPortal ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Loading...
            </>
          ) : (
            "Manage Subscription"
          )}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionClient;

