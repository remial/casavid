// app/api/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Stripe from 'stripe';
import { adminDB } from '@/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { priceId, promoApiId, successUrl, cancelUrl } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID
    const customerRef = adminDB.collection('customers').doc(userId);
    const customerDoc = await customerRef.get();
    
    let stripeCustomerId: string | undefined;
    if (customerDoc.exists) {
      stripeCustomerId = customerDoc.data()?.stripeId;
    }

    // Get DataFast cookies from the request
    const cookieStore = cookies();
    const datafastVisitorId = cookieStore.get('datafast_visitor_id')?.value || '';
    const datafastSessionId = cookieStore.get('datafast_session_id')?.value || '';

    // Prepare line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Create checkout session with DataFast metadata
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXTAUTH_URL || 'https://www.vidnarrate.com'}/success`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL || 'https://www.vidnarrate.com'}/pricing`,
      metadata: {
        datafast_visitor_id: datafastVisitorId,
        datafast_session_id: datafastSessionId,
      },
      // Pass DataFast metadata to subscription so it propagates to payment intents
      subscription_data: {
        metadata: {
          datafast_visitor_id: datafastVisitorId,
          datafast_session_id: datafastSessionId,
        },
      },
    };

    // Add promotion code if provided
    if (promoApiId) {
      sessionParams.discounts = [
        {
          promotion_code: promoApiId,
        },
      ];
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

