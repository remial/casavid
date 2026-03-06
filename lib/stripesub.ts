// lib/stripesub.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/firebase"; 
import { doc, getDoc } from "firebase/firestore";

export async function getUserSubscriptionPlan() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    console.log("User session is invalid or lacks an email, hence cannot determine subscription status.");
    return false;
  }

  const userRef = doc(db, 'users', session.user.id); 
  const dbUserSnap = await getDoc(userRef);

  if (!dbUserSnap.exists()) {
    console.log(`User document for ID ${session.user.id} does not exist.`);
    return false;
  }

  const userData = dbUserSnap.data();
  const hasSufficientCredits = userData.credits >= 4;

  const isSubscribed = hasSufficientCredits || (Boolean(
    userData.stripePriceId &&
    userData.stripeCurrentPeriodEnd &&
    userData.stripeCurrentPeriodEnd + 86_400_000 > Date.now()
  ));
  
  // Log statements based on subscription status
  if (isSubscribed) {
    console.log(`User: ${session.user.email}, ID: ${session.user.id} is subscribed.`);
  } else {
    console.log(`User: ${session.user.email}, ID: ${session.user.id} is not subscribed.`);
  }

  return isSubscribed;
}
