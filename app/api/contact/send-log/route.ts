// app/api/contact/send-log/route.ts
// Sends chat log email 30 minutes after conversation ends

import ChatLogEmail from "@/src/app/emails/ChatLog";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { adminDB } from "@/firebase-admin";
import { getUserCategoryLabel, UserCategory } from "@/lib/chatbot-knowledge";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "aimeromailbox@gmail.com";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function getUserCategory(
  isSignedIn: boolean,
  isSubscribed: boolean,
  subLevel: number
): UserCategory {
  if (!isSignedIn) {
    return "not_signed_in";
  }
  if (!isSubscribed || subLevel === 0) {
    return "signed_in_not_subscribed";
  }
  switch (subLevel) {
    case 1:
      return "starter";
    case 2:
      return "daily";
    case 3:
      return "twice_daily";
    default:
      return "signed_in_not_subscribed";
  }
}

export async function POST(req: Request) {
  try {
    const { messages, sessionStart } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No messages to send" },
        { status: 400 }
      );
    }

    // Get the current user's session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email || null;

    // Determine user category
    let isSignedIn = false;
    let isSubscribed = false;
    let subLevel = 0;

    if (userId) {
      isSignedIn = true;

      try {
        const userDoc = await adminDB.collection("users").doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          isSubscribed = userData?.isSubscribed || false;
          subLevel = userData?.subLevel || 0;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        isSubscribed = session?.user?.isSubscribed || false;
        subLevel = session?.user?.subLevel || 0;
      }
    }

    const userCategory = getUserCategory(isSignedIn, isSubscribed, subLevel);
    const userCategoryLabel = getUserCategoryLabel(userCategory);

    // Format timestamps
    const sessionEnd = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "full",
      timeStyle: "long",
    });

    const formattedSessionStart = sessionStart
      ? new Date(sessionStart).toLocaleString("en-US", {
          timeZone: "America/New_York",
          dateStyle: "full",
          timeStyle: "long",
        })
      : sessionEnd;

    // Add timestamps to messages if not present
    const messagesWithTimestamps: ChatMessage[] = messages.map(
      (msg: { role: string; content: string; timestamp?: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: msg.timestamp || new Date().toLocaleString("en-US", {
          timeZone: "America/New_York",
          timeStyle: "short",
        }),
      })
    );

    // Send email
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const data = await resend.emails.send({
      from: "CasaVid Support <hello@send.casavid.com>",
      replyTo: ["aimeromailbox@gmail.com"],
      to: [ADMIN_EMAIL],
      subject: `Support Chat Log - ${userEmail || "Anonymous User"}`,
      react: ChatLogEmail({
        userEmail,
        userCategory: userCategoryLabel,
        messages: messagesWithTimestamps,
        sessionStart: formattedSessionStart,
        sessionEnd,
      }),
    });

    console.log(
      `[send-log] Chat log sent for user ${userEmail || "anonymous"} (${userCategoryLabel})`
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[send-log] Error sending chat log:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
