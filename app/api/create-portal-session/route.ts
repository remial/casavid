import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { adminDB } from "@/firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get the user's Stripe customer ID from the customers collection
    const customerRef = adminDB.collection('customers').doc(userId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      return NextResponse.json(
        { redirectTo: "/pricing", message: "No subscription found. Please subscribe to continue." },
        { status: 200 }
      );
    }

    const customerData = customerDoc.data();
    const stripeCustomerId = customerData?.stripeId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { redirectTo: "/pricing", message: "No subscription found. Please subscribe to continue." },
        { status: 200 }
      );
    }

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL || 'https://www.vidnarrate.com'}/settings`,
    });

    if (!portalSession.url) {
      throw new Error("Stripe did not return a portal URL");
    }

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Error creating billing portal session:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
