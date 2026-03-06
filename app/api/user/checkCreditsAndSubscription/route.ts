// app/api/user/checkCreditsAndSubscription.ts
import { getServerSession } from "next-auth";
import { adminDB } from "@/firebase-admin";
import { authOptions } from "@/auth";
import { checkSub } from "@/app/api/check-sub/route";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Check subscription status
  const subscriptionData = await checkSub(userId);

  // Check credits from Firestore
  const userRef = adminDB.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const credits = userDoc.exists ? userDoc.data()?.credits || 0 : 0;

  return NextResponse.json({
    isSubscribed: subscriptionData.isSubscribed,
    credits,
  });
}
