// app/api/webhook/stripe/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});
const webhookSecret = process.env.STRIPE_ENDPOINT_SECRET;

// Hard-coded production URL for pause emails
const PAUSE_EMAIL_URL = 'https://www.casavid.com/api/emails/pause';

// Hard-coded production URL for portal notification emails
const PORTAL_NOTIFICATION_URL = 'https://www.casavid.com/api/emails/portal-notification';

// Helper: determine base URL for internal API calls
function getBaseUrl(reqUrl: string) {
  // Use an explicit environment variable if set
  let baseUrl = process.env.BASE_URL || '';
  if (!baseUrl) {
    baseUrl = new URL(reqUrl).origin;
    // In production, ensure HTTPS
    if (process.env.NODE_ENV === 'production' && baseUrl.startsWith('http://')) {
      baseUrl = baseUrl.replace('http://', 'https://');
    }
  }
  return baseUrl;
}

// Helper function to send portal notification emails
async function sendPortalNotification(
  userEmail: string,
  changeType: string,
  changeDetails: string,
  baseUrl: string
) {
  try {
    const notificationResponse = await fetch(`${baseUrl}/api/emails/portal-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        changeType,
        changeDetails,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!notificationResponse.ok) {
      console.error('Failed to send portal notification email:', await notificationResponse.text());
    } else {
      console.log(`Portal notification email sent successfully for ${changeType} by ${userEmail}`);
    }
  } catch (error) {
    console.error('Error sending portal notification email:', error);
  }
}

// Map Stripe Price IDs to entitlements (immutable, works with coupons/discounts)
const priceIdToEntitlements: Record<string, {
  credits: number;
  maxCredits: number;
  subLevel: number;
  billingPeriod: 'monthly' | 'yearly';
  planName: string;
}> = {
  // Starter Plan - 5 credits, subLevel 1
  'price_1T7sibLHSgRRnn5DBAyNexQu': {
    credits: 5,
    maxCredits: 5,
    subLevel: 1,
    billingPeriod: 'monthly',
    planName: 'Starter Plan'
  },
  // Pro Plan - 20 credits, subLevel 2
  'price_1T7sjWLHSgRRnn5DionEak0x': {
    credits: 20,
    maxCredits: 20,
    subLevel: 2,
    billingPeriod: 'monthly',
    planName: 'Pro Plan'
  },
  // Premium Plan - 50 credits, subLevel 3
  'price_1T7spOLHSgRRnn5DgQbnFpIk': {
    credits: 50,
    maxCredits: 50,
    subLevel: 3,
    billingPeriod: 'monthly',
    planName: 'Premium Plan'
  },
};

// List of user IDs to exempt from invoice.payment_failed database modifications
const exemptList: string[] = [
   'm7nrZ7x3GBbBHWfQG0RJ9Gk1CjL2'
  // add more user IDs here as needed
];

export async function POST(req: Request) {
  const body = await req.text();
  const reqHeaders = headers();
  const signature = reqHeaders.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('Event constructed successfully:', event.type);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${(err as Error).message}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const eventType = event.type;

  try {
    // ─────────────────────────────────────────────────────────────────────────────
    // 0) Handle top-up payments (one-time purchases)
    // ─────────────────────────────────────────────────────────────────────────────
    if (eventType === 'checkout.session.completed') {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      
      if (checkoutSession.metadata?.type === 'topup') {
        const userId = checkoutSession.metadata.userId;
        const creditsToAdd = parseInt(checkoutSession.metadata.credits || '0', 10);
        
        if (!userId) {
          console.error('Top-up webhook: No userId in metadata');
          return NextResponse.json({ success: true }, { status: 200 });
        }
        
        const userRef = admin.firestore().doc(`users/${userId}`);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          console.error(`Top-up webhook: User document not found for ID: ${userId}`);
          return NextResponse.json({ error: 'User document not found' }, { status: 404 });
        }
        
        const currentCredits = userDoc.data()?.credits ?? 0;
        const newCredits = currentCredits + creditsToAdd;
        
        await userRef.update({
          credits: newCredits,
          lastTopUp: admin.firestore.Timestamp.now(),
          lastTopUpAmount: creditsToAdd,
        });
        
        console.log(`✅ Top-up successful for user ${userId}: +${creditsToAdd} credits (${currentCredits} → ${newCredits})`);
        return NextResponse.json({ success: true }, { status: 200 });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 1) Handle successful payments (checkout.session.completed & invoice.payment_succeeded)
    // ─────────────────────────────────────────────────────────────────────────────
    if (eventType === 'checkout.session.completed' || eventType === 'invoice.payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session | Stripe.Invoice;
      const cusId = (
        eventType === 'checkout.session.completed'
          ? (session as Stripe.Checkout.Session).customer
          : (session as Stripe.Invoice).customer
      ) as string | null;

      if (!cusId) {
        console.warn(`Customer ID is null for event ${eventType}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // For invoice.payment_succeeded, check if this is a proration/upgrade invoice
      // These should be skipped since customer.subscription.updated handles plan changes
      if (eventType === 'invoice.payment_succeeded') {
        const invoice = session as Stripe.Invoice;
        const billingReason = invoice.billing_reason;
        
        // Skip proration invoices - they're generated during plan upgrades/downgrades
        // The customer.subscription.updated event handles the entitlement changes
        if (billingReason === 'subscription_update') {
          console.log(`⏭️ Skipping invoice.payment_succeeded for proration invoice (billing_reason: ${billingReason}). Plan changes are handled by customer.subscription.updated.`);
          return NextResponse.json({ success: true }, { status: 200 });
        }
      }

      // Lookup user ID by Stripe customer ID
      const customersRef = admin.firestore().collection('customers');
      const customerSnap = await customersRef.where('stripeId', '==', cusId).get();
      if (customerSnap.empty) {
        console.warn(`No user found for customer ID ${cusId}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }
      const userId = customerSnap.docs[0].id;
      const userRef = admin.firestore().doc(`users/${userId}`);

      // Extract Price ID from the session/invoice
      let priceId: string | null = null;
      if (eventType === 'checkout.session.completed') {
        const checkoutSession = session as Stripe.Checkout.Session;
        priceId = checkoutSession.line_items?.data?.[0]?.price?.id || null;
      } else {
        const invoice = session as Stripe.Invoice;
        // For regular subscription renewals, get the price from the subscription
        // This avoids issues with multi-line invoices
        if (invoice.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            priceId = subscription.items.data?.[0]?.price?.id || null;
          } catch (err) {
            console.error('Error retrieving subscription for invoice:', err);
            priceId = invoice.lines?.data?.[0]?.price?.id || null;
          }
        } else {
          priceId = invoice.lines?.data?.[0]?.price?.id || null;
        }
      }

      if (!priceId) {
        console.warn(`No price ID found for event ${eventType}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Map Price ID → entitlements
      const entitlements = priceIdToEntitlements[priceId];
      if (entitlements) {
        const { credits: creditsToAdd, maxCredits, subLevel, billingPeriod, planName } = entitlements;
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          console.error(`User document not found for ID: ${userId}`);
          return NextResponse.json({ error: 'User document not found' }, { status: 404 });
        }

        const currentCredits = userDoc.data()?.credits ?? 0;
        let updatedCredits = currentCredits + creditsToAdd;
        if (updatedCredits > maxCredits) {
          updatedCredits = maxCredits;
        }

        // Calculate next credit refresh date
        const now = admin.firestore.Timestamp.now();
        const nextRefreshDate = new Date();
        nextRefreshDate.setMonth(nextRefreshDate.getMonth() + 1); // Next month for both monthly and yearly
        const nextCreditRefresh = admin.firestore.Timestamp.fromDate(nextRefreshDate);

        // Get subscription ID from the session/invoice
        let subscriptionId: string | null = null;
        if (eventType === 'checkout.session.completed') {
          const checkoutSession = session as Stripe.Checkout.Session;
          subscriptionId = checkoutSession.subscription as string;
        } else {
          const invoice = session as Stripe.Invoice;
          subscriptionId = invoice.subscription as string;
        }

        console.log(`✅ Updating user ${userId} to ${planName}: Credits ${currentCredits} → ${updatedCredits}, SubLevel: ${subLevel}, Period: ${billingPeriod}`);
        await userRef.update({
          credits: updatedCredits,
          isSubscribed: true,
          subLevel,
          billingPeriod,
          lastCreditRefresh: now,
          nextCreditRefresh,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
        });
      } else {
        console.warn(`⚠️ Unknown Price ID: ${priceId} - Please add this to priceIdToEntitlements map`);
      }

      // Fire initial-purchase CAPI event (only on checkout.session.completed)
      if (eventType === 'checkout.session.completed') {
        const checkoutSession = session as Stripe.Checkout.Session;
        
        // Log DataFast metadata for debugging
        const datafastVisitorId = checkoutSession.metadata?.datafast_visitor_id;
        const datafastSessionId = checkoutSession.metadata?.datafast_session_id;
        if (!datafastVisitorId || !datafastSessionId) {
          console.warn(`DataFast metadata missing in checkout session ${checkoutSession.id}. Visitor ID: ${datafastVisitorId || 'missing'}, Session ID: ${datafastSessionId || 'missing'}`);
        } else {
          console.log(`DataFast metadata present in checkout session ${checkoutSession.id}. Visitor ID: ${datafastVisitorId}, Session ID: ${datafastSessionId}`);
        }
        
        if (checkoutSession.payment_status === 'paid' && checkoutSession.customer_details?.email) {
          const origin = new URL(req.url).origin;
          const capiPayload = {
            email: checkoutSession.customer_details.email,
            eventId: checkoutSession.id,
            value: (checkoutSession.amount_subtotal ?? 0) / 100,
            currency: checkoutSession.currency?.toUpperCase() ?? 'USD',
            fbp: checkoutSession.metadata?.fbp || '',
            fbc: checkoutSession.metadata?.fbc || '',
          };

          // Call Facebook CAPI
          try {
            await fetch(`${origin}/api/metacapi`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...capiPayload,
                eventName: 'Purchase',
              }),
            });
            console.log('Metacapi called for initial purchase');
          } catch (err) {
            console.error('Error calling Metacapi:', err);
          }

          // Call Snapchat CAPI
          try {
            await fetch(`${origin}/api/snapcapi`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...capiPayload,
                eventName: 'PURCHASE',
                price: capiPayload.value,
              }),
            });
            console.log('Snapchat CAPI called for initial purchase');
          } catch (err) {
            console.error('Error calling Snapchat CAPI:', err);
          }
        } else {
          console.warn('Skipping CAPI calls: payment not completed or missing email');
        }
      }

      // Restore archived plans if any exist
      const archiveRef = admin.firestore()
        .collection('schedules')
        .doc(userId)
        .collection('plans_archive');
      const archiveSnap = await archiveRef.get();
      if (!archiveSnap.empty) {
        const plansRef = admin.firestore()
          .collection('schedules')
          .doc(userId)
          .collection('plans');

        for (const doc of archiveSnap.docs) {
          await plansRef.doc(doc.id).set(doc.data());
          await archiveRef.doc(doc.id).delete();
          console.log(`Restored archived plan ${doc.id} for user ${userId}`);
        }
      }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2) Handle failed invoice payments (invoice.payment_failed)
    // ─────────────────────────────────────────────────────────────────────────────
    } else if (eventType === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const cusId = invoice.customer as string | null;
      if (!cusId) {
        console.warn('invoice.payment_failed with no customer ID');
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Get the subscription ID that failed
      const failedSubscriptionId = invoice.subscription as string | null;
      
      // ─────────────────────────────────────────────────────────────────────────────
      // CRITICAL: Check if this is a 3D Secure payment in progress
      // When 3DS is required, Stripe fires invoice.payment_failed BEFORE the customer
      // has completed authentication. We should NOT zero out or send pause emails
      // for subscriptions that are still "incomplete" (awaiting 3DS completion).
      // ─────────────────────────────────────────────────────────────────────────────
      if (failedSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(failedSubscriptionId);
          
          // Skip if subscription is "incomplete" - payment is still pending (e.g., 3DS in progress)
          if (subscription.status === 'incomplete') {
            console.log(`⏭️ Skipping invoice.payment_failed for subscription ${failedSubscriptionId} - status is "incomplete" (likely 3DS in progress)`);
            return NextResponse.json({ success: true }, { status: 200 });
          }
          
          // Also skip for "past_due" on new subscriptions - billing_reason tells us if it's new vs renewal
          // "subscription_create" = new subscription, "subscription_cycle" = renewal
          if (invoice.billing_reason === 'subscription_create' && subscription.status !== 'canceled') {
            console.log(`⏭️ Skipping invoice.payment_failed for NEW subscription ${failedSubscriptionId} (billing_reason: ${invoice.billing_reason}, status: ${subscription.status}). Customer may still complete payment.`);
            return NextResponse.json({ success: true }, { status: 200 });
          }
          
          console.log(`Processing invoice.payment_failed for subscription ${failedSubscriptionId} (status: ${subscription.status}, billing_reason: ${invoice.billing_reason})`);
        } catch (subError) {
          console.error('Error retrieving subscription for payment_failed check:', subError);
          // Continue with normal processing if we can't retrieve the subscription
        }
      }

      // Check if customer has other ACTIVE subscriptions before zeroing out
      const activeSubscriptions = await stripe.subscriptions.list({
        customer: cusId,
        status: 'active',
      });

      // Filter out the failed subscription from the list
      const otherActiveSubscriptions = activeSubscriptions.data.filter(
        sub => sub.id !== failedSubscriptionId
      );

      if (otherActiveSubscriptions.length > 0) {
        console.log(`Customer ${cusId} has ${otherActiveSubscriptions.length} other active subscription(s). Skipping zero-out for failed subscription ${failedSubscriptionId}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Lookup user ID by Stripe customer ID
      const customersRef = admin.firestore().collection('customers');
      const customerSnap = await customersRef.where('stripeId', '==', cusId).get();
      if (customerSnap.empty) {
        console.warn(`No user found for customer ID ${cusId}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }
      const userId = customerSnap.docs[0].id;
      const userRef = admin.firestore().doc(`users/${userId}`);

      // Skip modifications for exempted users
      if (exemptList.includes(userId)) {
        console.log(`Skipping database modifications for exempted user ${userId}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Zero out user allowance
      await userRef.update({
        credits: 0,
        isSubscribed: false,
        subLevel: 0,
      });
      console.log(`Reset allowances for user ${userId} after payment failure`);

      // Archive scheduled plans
      const plansRef = admin.firestore()
        .collection('schedules')
        .doc(userId)
        .collection('plans');
      const plansSnap = await plansRef.get();
      if (!plansSnap.empty) {
        const archiveRef = admin.firestore()
          .collection('schedules')
          .doc(userId)
          .collection('plans_archive');

        for (const doc of plansSnap.docs) {
          await archiveRef.doc(doc.id).set(doc.data());
          await plansRef.doc(doc.id).delete();
          console.log(`Archived plan ${doc.id} for user ${userId}`);
        }
      }

      // ─────────────────────────────────────────────────────────────────────────────
      // Send a pause email, but no more than once every 30 days
      // ─────────────────────────────────────────────────────────────────────────────
      const userDoc = await userRef.get();
      const lastSent: admin.firestore.Timestamp | undefined = userDoc.data()?.lastPauseEmailSent;
      const now = admin.firestore.Timestamp.now();
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

      if (!lastSent || now.toMillis() - lastSent.toMillis() > THIRTY_DAYS_MS) {
        // Determine the user's email
        let userEmail: string | null = invoice.customer_email ?? null;
        if (!userEmail) {
          const stripeCustomer = (await stripe.customers.retrieve(cusId)) as Stripe.Customer;
          userEmail = stripeCustomer.email ?? null;
        }

        if (userEmail) {
          try {
            console.log(`Sending pause email to ${userEmail} via ${PAUSE_EMAIL_URL}`);
            await fetch(PAUSE_EMAIL_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userEmail }),
            });
            await userRef.update({ lastPauseEmailSent: now });
            console.log(`Sent pause email to ${userEmail} and updated lastPauseEmailSent`);
          } catch (err) {
            console.error('Error sending pause email:', err);
          }
        } else {
          console.warn(`Could not determine email for customer ID ${cusId}, skipping pause email`);
        }
      } else {
        console.log('Pause email already sent within last 30 days, skipping.');
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3) Handle subscription cancellations (customer.subscription.deleted)
    // ─────────────────────────────────────────────────────────────────────────────
    else if (eventType === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const cusId = subscription.customer as string | null;
      
      if (!cusId) {
        console.warn('customer.subscription.deleted with no customer ID');
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Check if customer has other ACTIVE subscriptions before zeroing out
      // (The deleted subscription won't appear in this list since it's already deleted)
      const activeSubscriptions = await stripe.subscriptions.list({
        customer: cusId,
        status: 'active',
      });

      if (activeSubscriptions.data.length > 0) {
        console.log(`Customer ${cusId} has ${activeSubscriptions.data.length} other active subscription(s). Skipping zero-out for deleted subscription ${subscription.id}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Lookup user ID by Stripe customer ID
      const customersRef = admin.firestore().collection('customers');
      const customerSnap = await customersRef.where('stripeId', '==', cusId).get();
      if (customerSnap.empty) {
        console.warn(`No user found for customer ID ${cusId}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }
      const userId = customerSnap.docs[0].id;
      const userRef = admin.firestore().doc(`users/${userId}`);

      // Skip modifications for exempted users
      if (exemptList.includes(userId)) {
        console.log(`Skipping database modifications for exempted user ${userId}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Determine if this is an immediate cancellation or end-of-period cancellation
      const now = Math.floor(Date.now() / 1000);
      const canceledAt = subscription.canceled_at;
      const currentPeriodEnd = subscription.current_period_end;
      
      // If canceled_at is close to current_period_end, it's likely an end-of-period cancellation
      // If canceled_at is close to now, it's likely an immediate cancellation
      const isImmediateCancellation = canceledAt && Math.abs(canceledAt - now) < 300; // Within 5 minutes
      const isEndOfPeriodCancellation = canceledAt && Math.abs(canceledAt - currentPeriodEnd) < 300;

      console.log(`Subscription ${subscription.id} cancelled for user ${userId}. Immediate: ${isImmediateCancellation}, End-of-period: ${isEndOfPeriodCancellation}`);

      // Zero out user allowance and update subscription status
      await userRef.update({
        credits: 0,
        isSubscribed: false,
        subLevel: 0,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        subscriptionCancelledAt: admin.firestore.Timestamp.fromMillis(canceledAt ? canceledAt * 1000 : now * 1000),
        cancellationType: isImmediateCancellation ? 'immediate' : 'end_of_period'
      });
      console.log(`Reset allowances for user ${userId} after subscription cancellation`);

      // Archive scheduled plans
      const plansRef = admin.firestore()
        .collection('schedules')
        .doc(userId)
        .collection('plans');
      const plansSnap = await plansRef.get();
      if (!plansSnap.empty) {
        const archiveRef = admin.firestore()
          .collection('schedules')
          .doc(userId)
          .collection('plans_archive');

        for (const doc of plansSnap.docs) {
          await archiveRef.doc(doc.id).set({
            ...doc.data(),
            archivedAt: admin.firestore.Timestamp.now(),
            archiveReason: 'subscription_cancelled'
          });
          await plansRef.doc(doc.id).delete();
          console.log(`Archived plan ${doc.id} for user ${userId} due to subscription cancellation`);
        }
      }

      // Send portal notification
      const baseUrl = getBaseUrl(req.url);
      let userEmail: string | null = null;
      try {
        const customer = await stripe.customers.retrieve(cusId);
        if (customer && !customer.deleted) {
          userEmail = (customer as Stripe.Customer).email;
        }
      } catch (error) {
        console.error('Error retrieving customer details:', error);
      }

      if (userEmail) {
        const changeType = 'Subscription Cancelled';
        const changeDetails = `Subscription ${subscription.id} was cancelled ${isImmediateCancellation ? 'immediately' : 'at end of billing period'}`;
        // await sendPortalNotification(userEmail, changeType, changeDetails, baseUrl);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4) Handle billing portal events
    // ─────────────────────────────────────────────────────────────────────────────
    else if (eventType === 'customer.updated' || 
        eventType === 'payment_method.attached' || 
        eventType === 'payment_method.detached' ||
        eventType === 'customer.subscription.updated') {
      
      const baseUrl = getBaseUrl(req.url);
      let customerId: string | null = null;
      let userEmail: string | null = null;
      let changeType = '';
      let changeDetails = '';

      // Extract customer ID and details based on event type
      if (eventType === 'customer.updated') {
        const customer = event.data.object as Stripe.Customer;
        customerId = customer.id;
        changeType = 'Customer Information Updated';
        changeDetails = `Customer details were modified in the billing portal. Email: ${customer.email || 'N/A'}`;
        userEmail = customer.email || null;
      } else if (eventType === 'payment_method.attached') {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        customerId = paymentMethod.customer as string;
        changeType = 'Payment Method Added';
        changeDetails = `New payment method (${paymentMethod.type}) was added to the account`;
      } else if (eventType === 'payment_method.detached') {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        customerId = paymentMethod.customer as string;
        changeType = 'Payment Method Removed';
        changeDetails = `Payment method (${paymentMethod.type}) was removed from the account`;
      } else if (eventType === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = (event.data as any).previous_attributes;
        customerId = subscription.customer as string;
        
        // Check if this is a cancellation event
        const isCancellation = subscription.cancel_at_period_end || subscription.canceled_at;
        
        // Get the current price ID from the subscription
        const currentSubscriptionPriceId = subscription.items.data?.[0]?.price?.id;
        
        // Check if this is a plan change using multiple detection methods:
        // 1. Check previousAttributes.items (if Stripe includes it)
        // 2. Check previousAttributes.plan (older Stripe format)
        // 3. Compare with user's stored stripePriceId in database (most reliable)
        let isPlanChange = false;
        let oldPriceIdFromWebhook: string | undefined;
        
        // Method 1: Check previousAttributes.items
        if (previousAttributes?.items?.data?.[0]?.price?.id) {
          oldPriceIdFromWebhook = previousAttributes.items.data[0].price.id;
          isPlanChange = oldPriceIdFromWebhook !== currentSubscriptionPriceId;
        }
        // Method 2: Check previousAttributes.plan (older format)
        else if (previousAttributes?.plan?.id) {
          oldPriceIdFromWebhook = previousAttributes.plan.id;
          isPlanChange = oldPriceIdFromWebhook !== currentSubscriptionPriceId;
        }
        // Method 3: If no previous attributes, check if the subscription's price is different from user's stored price
        else if (currentSubscriptionPriceId && priceIdToEntitlements[currentSubscriptionPriceId]) {
          // We'll verify against the database later - for now, assume it could be a plan change
          // if the price ID is in our entitlements map
          isPlanChange = true;
          console.log(`Plan change detection: No previousAttributes.items found, will verify against database for price ${currentSubscriptionPriceId}`);
        }
        
        if (isCancellation && !isPlanChange) {
          changeType = 'Subscription Cancelled';
          
          // Extract detailed cancellation information
          const cancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : 'N/A';
          const canceledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : 'N/A';
          const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : 'N/A';
          
          let cancellationReason = 'No reason provided';
          let cancellationComment = '';
          
          if (subscription.cancellation_details) {
            const { feedback, comment, reason } = subscription.cancellation_details;
            cancellationReason = feedback || reason || 'No reason provided';
            cancellationComment = comment || '';
          }
          
          const cancellationType = subscription.cancel_at_period_end ? 'End of Period' : 'Immediate';
          
          // Get customer details for email notification
          let customerName = 'Unknown';
          let customerEmail = 'Unknown';
          
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted) {
              customerName = customer.name || 'No name provided';
              customerEmail = customer.email || 'No email provided';
            }
          } catch (customerError) {
            console.error('Error retrieving customer details for email:', customerError);
          }

          changeDetails = `SUBSCRIPTION CANCELLED - ${cancellationType}
          
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Subscription ID: ${subscription.id}
Customer ID: ${customerId}
Cancellation Type: ${cancellationType}
Cancellation Reason: ${cancellationReason}
Customer Comment: ${cancellationComment}
Cancel At: ${cancelAt}
Canceled At: ${canceledAt}
Current Period End: ${currentPeriodEnd}
Subscription Status: ${subscription.status}`;

          // Log detailed cancellation to Firestore
          try {
            // Create date-based folder structure (YYYY-MM-DD format)
            const today = new Date();
            const dateFolder = today.toISOString().split('T')[0]; // YYYY-MM-DD
            
            const cancellationLogRef = admin.firestore()
              .collection('cancellation_logs')
              .doc(dateFolder)
              .collection('cancellations')
              .doc();
              
            await cancellationLogRef.set({
              subscriptionId: subscription.id,
              customerId: customerId,
              customerName: customerName,
              customerEmail: customerEmail,
              cancellationType: cancellationType,
              cancellationReason: cancellationReason,
              customerComment: cancellationComment,
              cancelAt: subscription.cancel_at ? admin.firestore.Timestamp.fromMillis(subscription.cancel_at * 1000) : null,
              canceledAt: subscription.canceled_at ? admin.firestore.Timestamp.fromMillis(subscription.canceled_at * 1000) : null,
              currentPeriodEnd: subscription.current_period_end ? admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000) : null,
              subscriptionStatus: subscription.status,
              planAmount: subscription.items?.data?.[0]?.price?.unit_amount || 0,
              planCurrency: subscription.items?.data?.[0]?.price?.currency || 'usd',
              createdAt: admin.firestore.Timestamp.now(),
              webhookEventId: event.id,
              webhookEventType: eventType
            });
            console.log(`Logged detailed cancellation for subscription ${subscription.id} in date folder ${dateFolder}`);
          } catch (logError) {
            console.error('Error logging cancellation details:', logError);
          }
        } else if (isPlanChange) {
          // Handle plan upgrade/downgrade
          const newPriceId = currentSubscriptionPriceId;
          let oldPriceId = oldPriceIdFromWebhook;
          
          // CRITICAL: Only process plan changes if the subscription is actually active
          // This prevents granting credits when payment fails and subscription goes to
          // incomplete_expired, past_due, unpaid, or canceled status
          const validStatusesForCredits = ['active', 'trialing'];
          if (!validStatusesForCredits.includes(subscription.status)) {
            console.log(`⏭️ Skipping plan change credit grant - subscription status is "${subscription.status}" (not active/trialing)`);
            changeType = 'Subscription Status Changed';
            changeDetails = `Subscription status changed to ${subscription.status}. No credits granted.`;
          } else if (!newPriceId) {
            console.warn('Plan change detected but no new Price ID found');
            changeDetails = 'Your subscription plan has been changed successfully.';
          } else {
            // Get entitlements from Price ID
            const newEntitlements = priceIdToEntitlements[newPriceId];
            const oldEntitlements = oldPriceId ? priceIdToEntitlements[oldPriceId] : null;
            
            if (newEntitlements) {
              const { credits: newPlanCredits, maxCredits, subLevel, billingPeriod, planName } = newEntitlements;
              
              // Lookup user ID by Stripe customer ID
              const customersRef = admin.firestore().collection('customers');
              const customerSnap = await customersRef.where('stripeId', '==', customerId).get();
              
              if (!customerSnap.empty) {
                const userId = customerSnap.docs[0].id;
                const userRef = admin.firestore().doc(`users/${userId}`);
                
                // Get current user data
                const userDoc = await userRef.get();
                const userData = userDoc.data();
                const currentCredits = userData?.credits ?? 0;
                const currentSubLevel = userData?.subLevel ?? 0;
                const storedPriceId = userData?.stripePriceId;
                const upgradeSource = userData?.upgradeSource;
                
                // If we didn't get oldPriceId from webhook, use the stored price ID from database
                if (!oldPriceId && storedPriceId) {
                  oldPriceId = storedPriceId;
                  console.log(`Using stored stripePriceId from database as oldPriceId: ${oldPriceId}`);
                }
                
                // Get old entitlements based on the resolved oldPriceId
                const oldEntitlements = oldPriceId ? priceIdToEntitlements[oldPriceId] : null;
                
                // Determine if upgrade or downgrade based on subLevel
                const isUpgrade = oldEntitlements ? newEntitlements.subLevel > oldEntitlements.subLevel : true;
                changeType = isUpgrade ? 'Subscription Upgraded' : 'Subscription Downgraded';
                
                // Check if the user's stored price already matches the new price (no actual change needed)
                if (storedPriceId === newPriceId) {
                  console.log(`⏭️ Skipping webhook update for user ${userId} - stripePriceId already matches (${newPriceId})`);
                  changeDetails = `Subscription confirmed as ${planName}. (Already up to date)`;
                }
                // Check if upgrade was already handled by /api/perform-upgrade
                else if (currentSubLevel === subLevel && upgradeSource === 'app') {
                  console.log(`⏭️ Skipping webhook update for user ${userId} - already upgraded via app (subLevel: ${currentSubLevel})`);
                  
                  // Clear the upgradeSource flag and update the stripePriceId to match
                  await userRef.update({ 
                    upgradeSource: admin.firestore.FieldValue.delete(),
                    stripePriceId: newPriceId 
                  });
                  
                  changeDetails = `Your subscription has been ${isUpgrade ? 'upgraded' : 'downgraded'} to ${planName}. (Processed via app)`;
                } else {
                  // Calculate credit difference between plans
                  const oldPlanCredits = oldEntitlements?.credits ?? 0;
                  const creditDifference = newPlanCredits - oldPlanCredits;
                  
                  console.log(`📊 Plan change calculation for user ${userId}:`);
                  console.log(`   Old Price ID: ${oldPriceId || 'unknown'}, Old Credits: ${oldPlanCredits}`);
                  console.log(`   New Price ID: ${newPriceId}, New Credits: ${newPlanCredits}`);
                  console.log(`   Credit Difference: ${creditDifference}`);
                  
                  // Add the difference to current credits (can be negative for downgrades)
                  let finalCredits = currentCredits + creditDifference;
                  
                  // Don't allow negative credits
                  if (finalCredits < 0) {
                    finalCredits = 0;
                  }
                  
                  // Cap at new plan's max credits
                  if (finalCredits > maxCredits) {
                    finalCredits = maxCredits;
                  }
                  
                  // Calculate next credit refresh date
                  const now = admin.firestore.Timestamp.now();
                  const nextRefreshDate = new Date(subscription.current_period_end * 1000);
                  const nextCreditRefresh = admin.firestore.Timestamp.fromDate(nextRefreshDate);
                  
                  // Update user with new plan details
                  await userRef.update({
                    credits: finalCredits,
                    subLevel,
                    billingPeriod,
                    stripePriceId: newPriceId,
                    stripeSubscriptionId: subscription.id,
                    nextCreditRefresh,
                    lastPlanChange: now,
                    isSubscribed: true,
                  });
                  
                  console.log(`✅ ${changeType}: User ${userId} → ${planName}`);
                  console.log(`   Credits: ${currentCredits} (had) + ${creditDifference} (difference) = ${finalCredits} (final)`);
                  console.log(`   SubLevel: ${subLevel}`);
                  
                  const oldPlanName = oldEntitlements?.planName || 'Previous Plan';
                  changeDetails = `Your subscription has been ${isUpgrade ? 'upgraded' : 'downgraded'} from ${oldPlanName} to ${planName}. Credits adjusted by ${creditDifference > 0 ? '+' : ''}${creditDifference} (now ${finalCredits} total).`;
                }
              } else {
                console.warn(`No user found for customer ID ${customerId} during plan change`);
                changeDetails = `Your subscription plan has been changed successfully.`;
              }
            } else {
              console.warn(`⚠️ Unknown Price ID during plan change: ${newPriceId}`);
              changeDetails = `Your subscription plan has been changed successfully.`;
            }
          }
        } else {
          changeType = 'Subscription Updated';
          changeDetails = `Subscription ${subscription.id} was modified. Status: ${subscription.status}`;
        }
      }

      if (customerId) {
        // Get user email if not already available
        if (!userEmail) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted) {
              userEmail = (customer as Stripe.Customer).email;
            }
          } catch (error) {
            console.error('Error retrieving customer details:', error);
          }
        }

        if (userEmail) {
          // await sendPortalNotification(userEmail, changeType, changeDetails, baseUrl);
        } else {
          console.warn(`Could not determine email for customer ID ${customerId}, skipping portal notification`);
        }
      }
    }
  } catch (err) {
    console.error(
      `Stripe webhook handler error: ${(err as Error).message} | eventType=${eventType}`
    );
    // Return 200 so Stripe won’t retry on side-effect errors
    return NextResponse.json(
      { success: true, message: 'Unhandled error', details: (err as Error).message },
      { status: 200 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
