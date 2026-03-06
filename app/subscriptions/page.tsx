import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import React from "react";
import SubscriptionClient from "@/components/SubscriptionClient";

const SubscriptionsPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="text-2xl m-6">Please sign in...</div>;
  }

  return <SubscriptionClient />;
};

export default SubscriptionsPage;

