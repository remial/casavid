import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { adminDB } from "@/firebase-admin";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

const TWICE_DAILY_PRICE_ID = "price_1QNAd5LqZXIo1J6dwEsexReQ";

// Twice Daily Plan entitlements
const TWICE_DAILY_ENTITLEMENTS = {
  maxCredits: 62,
  subLevel: 3,
  seriesLimit: 1,
  weeklyLimit: 14,
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized", redirectTo: "/pricing" }, { status: 401 });
    }

    const { subscriptionId, subscriptionItemId } = await req.json();

    if (!subscriptionId || !subscriptionItemId) {
      return NextResponse.json({ error: "Missing subscription info", redirectTo: "/pricing" }, { status: 400 });
    }

    const userId = session.user.id;
    const customerDoc = await adminDB.collection('customers').doc(userId).get();

    if (!customerDoc.exists) {
      return NextResponse.json({ redirectTo: "/pricing" }, { status: 200 });
    }

    const stripeCustomerId = customerDoc.data()?.stripeId;
    if (!stripeCustomerId) {
      return NextResponse.json({ redirectTo: "/pricing" }, { status: 200 });
    }

    // Verify the subscription belongs to this customer
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.customer !== stripeCustomerId) {
      return NextResponse.json({ error: "Unauthorized", redirectTo: "/pricing" }, { status: 403 });
    }

    // Calculate how far through the billing cycle the user is
    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;
    const now = Math.floor(Date.now() / 1000);
    
    const totalPeriodLength = currentPeriodEnd - currentPeriodStart;
    const elapsedTime = now - currentPeriodStart;
    const cycleProgress = elapsedTime / totalPeriodLength;
    
    // Determine credits to add based on billing cycle progress
    // Less than halfway: 61 credits and 10 cinema credits
    // More than halfway: 31 credits and 5 cinema credits
    const isLessThanHalfway = cycleProgress < 0.5;
    const creditsToAdd = isLessThanHalfway ? 61 : 31;
    const cinemaCreditsToGive = isLessThanHalfway ? 10 : 5;
    
    console.log(`📊 Billing cycle progress: ${(cycleProgress * 100).toFixed(1)}% (${isLessThanHalfway ? 'less than' : 'more than'} halfway)`);
    console.log(`   Will add ${creditsToAdd} credits and ${cinemaCreditsToGive} cinema credits`);

    // Perform the upgrade with immediate proration charge
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionItemId,
          price: TWICE_DAILY_PRICE_ID,
        },
      ],
      proration_behavior: 'always_invoice',
      payment_behavior: 'error_if_incomplete',
    });

    // Get user's current credits
    const userDoc = await adminDB.collection('users').doc(userId).get();
    const currentCredits = userDoc.data()?.credits ?? 0;

    // Add credits based on billing cycle progress
    let finalCredits = currentCredits + creditsToAdd;

    // Cap at max credits for the new plan
    if (finalCredits > TWICE_DAILY_ENTITLEMENTS.maxCredits) {
      finalCredits = TWICE_DAILY_ENTITLEMENTS.maxCredits;
    }

    // Calculate next credit refresh date from subscription
    const nextRefreshDate = new Date(updatedSubscription.current_period_end * 1000);

    // Determine billing period from current subscription
    const currentBillingPeriod = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';

    // Update user with full Twice Daily plan entitlements immediately
    await adminDB.collection('users').doc(userId).update({
      credits: finalCredits,
      creditsCinema: cinemaCreditsToGive,
      subLevel: TWICE_DAILY_ENTITLEMENTS.subLevel,
      seriesLimit: TWICE_DAILY_ENTITLEMENTS.seriesLimit,
      weeklyLimit: TWICE_DAILY_ENTITLEMENTS.weeklyLimit,
      isSubscribed: true,
      billingPeriod: currentBillingPeriod,
      stripePriceId: TWICE_DAILY_PRICE_ID,
      stripeSubscriptionId: updatedSubscription.id,
      nextCreditRefresh: nextRefreshDate,
      lastPlanChange: FieldValue.serverTimestamp(),
      upgradeSource: 'app', // Mark that this upgrade came from the app
    });

    console.log(`✅ Upgrade completed for user ${userId}: Credits ${currentCredits} + ${creditsToAdd} = ${finalCredits}, Cinema: ${cinemaCreditsToGive}, SubLevel: 3, Cycle: ${(cycleProgress * 100).toFixed(1)}%`);

    return NextResponse.json({
      success: true,
      message: "Successfully upgraded to Twice Daily plan!",
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
      },
    });
  } catch (err) {
    console.error("Error performing upgrade:", err);
    return NextResponse.json(
      { error: (err as Error).message, redirectTo: "/pricing" },
      { status: 500 }
    );
  }
}


