"use client";
import { auth, db } from "@/firebase";
import { FirebaseApp } from "firebase/app";

import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

export const getCheckoutUrl = async (
  app: FirebaseApp,
  priceId: string,
  promoApiId?: string // Optional promotion API ID parameter
): Promise<string> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User is not authenticated");

  const checkoutSessionRef = collection(
    db,
    "customers",
    userId,
    "checkout_sessions"
  );

  // Capture Facebook Pixel cookies for Meta CAPI
  const fbp = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbp='))
    ?.split('=')[1] || '';
  
  const fbc = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbc='))
    ?.split('=')[1] || '';

  // Capture DataFast cookies for revenue attribution
  const datafastVisitorId = document.cookie
    .split('; ')
    .find(row => row.startsWith('datafast_visitor_id='))
    ?.split('=')[1] || '';
  
  const datafastSessionId = document.cookie
    .split('; ')
    .find(row => row.startsWith('datafast_session_id='))
    ?.split('=')[1] || '';

  const docRef = await addDoc(checkoutSessionRef, {
    price: priceId,
    success_url: `${window.location.origin}/success`,
    cancel_url: `${window.location.origin}/pricing`,
    ...(promoApiId ? { promotion_code: promoApiId } : {}), // Only add promotion code if valid
    metadata: {
      fbp: fbp,
      fbc: fbc,
      datafast_visitor_id: datafastVisitorId,
      datafast_session_id: datafastSessionId,
    },
  });

  return new Promise<string>((resolve, reject) => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data() as {
        error?: { message: string };
        url?: string;
      };
      if (error) {
        unsubscribe();
        reject(new Error(`An error occurred: ${error.message}`));
      }
      if (url) {
        console.log("Stripe Checkout URL:", url);
        unsubscribe();
        resolve(url);
      }
    });
  });
};



export const getPortalUrl = async (app: FirebaseApp): Promise<string> => {
  const user = auth.currentUser;

  let dataWithUrl: any;
  try {
    const functions = getFunctions(app, "us-central1");
    const functionRef = httpsCallable(
      functions,
      "ext-firestore-stripe-payments-createPortalLink"
    );
    const { data } = await functionRef({
      customerId: user?.uid,
      returnUrl: window.location.origin,
    });

    console.log("Function data is:", data)
    dataWithUrl = data as { url: string };
    console.log("Reroute to Stripe portal: ", dataWithUrl.url);
  } catch (error) {
    console.error(error);
  }

  return new Promise<string>((resolve, reject) => {
    if (dataWithUrl.url) {
      resolve(dataWithUrl.url);
    } else {
      reject(new Error("No url returned"));
    }
  });
};