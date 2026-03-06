//lib/stripe.ts
import { getSession } from "next-auth/react";
import { db } from "@/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import Stripe from 'stripe';
import { PLANS } from '../src/config/stripe';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  //const session = await getSession({ req });

  const session = await getServerSession(authOptions);


  if (!session || !session.user || !session.user.email) {
    console.log("User session is invalid or lacks an email, hence cannot determine subscription status.");
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const userRef = doc(db, 'users', session.user.id); 
  const dbUserSnap = await getDoc(userRef);

  if (!dbUserSnap.exists()) {
    console.log(`User document for ID ${session.user.id} does not exist.`);
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const userData = dbUserSnap.data();
  {/*
  //Previous code
  const isSubscribed = Boolean(
    userData.stripePriceId &&
    userData.stripeCurrentPeriodEnd &&
    userData.stripeCurrentPeriodEnd + 86_400_000 > Date.now()
  );*/}

  // Additional option to have a subscriber also Check if user has credits >= 100
  const hasSufficientCredits = userData.credits >= 100;

  const isSubscribed = hasSufficientCredits || (Boolean(
    userData.stripePriceId &&
    userData.stripeCurrentPeriodEnd &&
    userData.stripeCurrentPeriodEnd + 86_400_000 > Date.now()
  ));

  const plan : any = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.production === userData.stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && userData.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);
    isCanceled = stripePlan.cancel_at_period_end;
  }

  if (isSubscribed) {
    console.log(`Customer ID ${session.user.id} is subscribed.`);
   
  } else {
    console.log(`Customer ID ${session.user.id}  is not subscribed.`);
  }

  return {
    ...plan,
    stripeSubscriptionId: userData.stripeSubscriptionId,
    stripeCurrentPeriodEnd: userData.stripeCurrentPeriodEnd,
    stripeCustomerId: userData.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
