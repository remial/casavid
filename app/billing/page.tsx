"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { getPortalUrl } from "@/app/_account/stripePayment";
import { app } from "@/firebase";

export const dynamic = "force-dynamic";

export default function BillingPage() {
  const handleBillingClick = async () => {
    try {
      const portalUrl = await getPortalUrl(app);
      window.location.assign(portalUrl);
    } catch (error) {
      console.error("Failed to create billing portal link:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Button
        onClick={handleBillingClick}
        className="bg-blue-600 text-white py-2 px-6 rounded"
      >
        Manage Billing
      </Button>
    </div>
  );
}
