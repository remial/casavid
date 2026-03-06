/*import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';


admin.initializeApp();

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2023-10-16',
});

const endpointSecret = functions.config().stripe.endpointsecret;

if (!endpointSecret) {
  console.error('Stripe endpoint secret is not set in Firebase functions configuration.');
  throw new Error('Stripe endpoint secret is not set.');
}

export const handleSubscriptionCredits = functions.region('europe-west2').https.onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  const sig = request.headers['stripe-signature'];

  if (typeof sig !== 'string') {
    response.status(400).send('Invalid Stripe Signature');
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);

    if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
      let session: Stripe.Checkout.Session | Stripe.Invoice = event.data.object;

      // Use the correct customer ID depending on the event type
      const cusId = event.type === 'checkout.session.completed' ? (session as Stripe.Checkout.Session).customer : (session as Stripe.Invoice).customer;

      if (typeof cusId !== 'string') {
        throw new Error("Customer ID is null");
      }

      // Query Firestore to find user ID associated with this Stripe customer ID
      const customersRef = admin.firestore().collection('customers');
      const querySnapshot = await customersRef.where('stripeId', '==', cusId).get();
      
      let userId = null;
      
      if (querySnapshot.empty) {
        console.log(`No document found for Stripe customer ID: ${cusId}`);
      } else {
        querySnapshot.forEach((doc) => {
          userId = doc.id;
          console.log(`Found user ID: ${userId} for Stripe customer ID: ${cusId}`);
        });
      
        if (!userId) {
          console.log(`Document ID for Stripe customer ID ${cusId} is null`);
          throw new Error(`No user found for Stripe customer ID: ${cusId}`);
        }
      }
      
      console.log("User Id is: ", userId);

      let price: number = 0;

      if (event.type === 'checkout.session.completed') {
        const amountSubtotal = (session as Stripe.Checkout.Session).amount_subtotal;
        if (amountSubtotal === null) {
          throw new Error("Session amount subtotal is null");
        }
        price = amountSubtotal;
      } else if (event.type === 'invoice.payment_succeeded') {
        const amountPaid = (session as Stripe.Invoice).amount_paid;
        if (amountPaid === null) {
          throw new Error("Invoice amount paid is null");
        }
        price = amountPaid;
      }

      console.log('Price is:', price);
      console.log('User ID is:', userId);

      const creditsToAdd = price === 1999 ? 300 : price === 999 ? 80 : 0;

      if (creditsToAdd > 0) {
        const userRef = admin.firestore().doc(`users/${userId}`);
        console.log('Database ref is:', userRef);
        console.log('Credits to add is:', creditsToAdd);

        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          throw new Error(`User document not found for ID: ${userId}`);
        }
        const userData = userDoc.data();
        const currentCredits = userData?.credits ?? 0;

        const updatedCredits = Math.min(creditsToAdd, creditsToAdd - (currentCredits - creditsToAdd));

        await userRef.update({
          credits: updatedCredits,
        });
      }
    }

    response.status(200).json({ received: true });
  } catch (error) {
    console.error('Error:', error);
    response.status(400).send(`Webhook Error: ${(error as Error).message}`);
  }
});

*/