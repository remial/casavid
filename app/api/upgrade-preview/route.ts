import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { adminDB } from "@/firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

const TWICE_DAILY_PRICE_ID = "price_1QNAd5LqZXIo1J6dwEsexReQ";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized", redirectTo: "/pricing" }, { status: 401 });
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

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ redirectTo: "/pricing" }, { status: 200 });
    }

    const subscription = subscriptions.data[0];
    const subscriptionItemId = subscription.items.data[0].id;

    // Check if already on Twice Daily plan
    if (subscription.items.data[0].price.id === TWICE_DAILY_PRICE_ID) {
      return NextResponse.json({ 
        error: "You're already on the Twice Daily plan",
        redirectTo: "/pricing"
      }, { status: 400 });
    }

    // Get the current plan's price to calculate maximum allowed proration
    const currentPrice = await stripe.prices.retrieve(subscription.items.data[0].price.id);
    const currentPriceAmount = (currentPrice.unit_amount || 0) / 100;
    
    // Get the new plan's price
    const newPrice = await stripe.prices.retrieve(TWICE_DAILY_PRICE_ID);
    const newPriceAmount = (newPrice.unit_amount || 0) / 100;
    
    // Maximum proration should never exceed the difference between the plans
    const maxProration = newPriceAmount - currentPriceAmount;

    // Preview the upcoming invoice with the new price (using always_invoice to show immediate charge)
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: stripeCustomerId,
      subscription: subscription.id,
      subscription_items: [
        {
          id: subscriptionItemId,
          price: TWICE_DAILY_PRICE_ID,
        },
      ],
      subscription_proration_behavior: 'always_invoice',
    });

    // Calculate only the prorated amount from line items (not the full next period charge)
    // Filter for proration items only - these have proration: true
    let proratedAmount = 0;
    for (const line of upcomingInvoice.lines.data) {
      if (line.proration) {
        proratedAmount += line.amount;
      }
    }
    
    // Convert from cents to dollars
    proratedAmount = proratedAmount / 100;
    
    // Ensure the amount is never negative (credits shouldn't result in negative charge)
    // and never exceeds the maximum possible proration (price difference between plans)
    const amountDue = Math.max(0, Math.min(proratedAmount, maxProration));
    const currency = upcomingInvoice.currency.toUpperCase();

    return NextResponse.json({
      amountDue,
      currency,
      currentPlan: subscription.items.data[0].price.nickname || "Current Plan",
      newPlan: "Twice Daily",
      newPlanPrice: 69, // Monthly price
      subscriptionId: subscription.id,
      subscriptionItemId,
    });
  } catch (err) {
    console.error("Error previewing upgrade:", err);
    return NextResponse.json(
      { error: (err as Error).message, redirectTo: "/pricing" },
      { status: 500 }
    );
  }
}


