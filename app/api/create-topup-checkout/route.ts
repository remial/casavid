// app/api/create-topup-checkout/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Stripe from 'stripe';
import { adminDB } from '@/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const TOPUP_PRICE_IDS: Record<string, { credits: number; cinemaCredits: number }> = {
  'price_1T6r7vLqZXIo1J6dDz8avbXv': { credits: 30, cinemaCredits: 10 },
  'price_1T6r8mLqZXIo1J6dd68i3i6b': { credits: 60, cinemaCredits: 10 },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    if (!TOPUP_PRICE_IDS[priceId]) {
      return NextResponse.json(
        { error: 'Invalid top-up price ID' },
        { status: 400 }
      );
    }

    const customerRef = adminDB.collection('customers').doc(userId);
    const customerDoc = await customerRef.get();
    
    let stripeCustomerId: string | undefined;
    if (customerDoc.exists) {
      stripeCustomerId = customerDoc.data()?.stripeId;
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please ensure you have an active subscription.' },
        { status: 400 }
      );
    }

    const topupInfo = TOPUP_PRICE_IDS[priceId];
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.vidnarrate.com';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/topup?success=true`,
      cancel_url: `${baseUrl}/topup`,
      metadata: {
        userId: userId,
        type: 'topup',
        credits: topupInfo.credits.toString(),
        cinemaCredits: topupInfo.cinemaCredits.toString(),
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating top-up checkout session:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
