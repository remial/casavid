// src/app/api/stripe/portal-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

// Always use your live domain
const BASE_URL = "https://www.casavid.com";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing required parameter: customerId" },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${BASE_URL}/account`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a portal URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error creating billing portal session:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
