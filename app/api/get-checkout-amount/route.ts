// app/api/get-checkout-amount/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get the amount - amount_total is in cents, so divide by 100
    const amountInCents = session.amount_total || session.amount_subtotal || 0;
    const amount = amountInCents / 100;
    const currency = session.currency?.toUpperCase() || 'USD';

    return NextResponse.json({ 
      amount, 
      currency,
      success: true 
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
