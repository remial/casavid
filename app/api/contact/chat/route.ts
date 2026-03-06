// app/api/contact/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { adminDB } from "@/firebase-admin";
import OpenAI from "openai";
import {
  buildSystemPrompt,
  UserCategory,
} from "@/lib/chatbot-knowledge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(req: NextRequest) {
  console.log("[Contact Chat] ========== NEW REQUEST ==========");
  
  try {
    const body = await req.json();
    const { messages } = body;
    
    console.log("[Contact Chat] Received messages:", messages?.length || 0);
    if (messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log("[Contact Chat] Last user message:", lastMessage?.content?.substring(0, 100));
    }

    if (!messages || !Array.isArray(messages)) {
      console.log("[Contact Chat] ERROR: Invalid messages array");
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get the current user's session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    // Determine user category
    let isSignedIn = false;
    let isSubscribed = false;
    let subLevel = 0;

    if (userId) {
      isSignedIn = true;
      
      // Detect sign-in method based on userId length
      // Shorter IDs (21 chars) = Google sign-in, Longer IDs (28 chars) = Email/Password
      const signInMethod = userId.length <= 22 ? "Google" : "Email/Password";

      // Fetch only needed user data from Firebase
      try {
        const userDoc = await adminDB.collection("users").doc(userId).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          isSubscribed = userData?.isSubscribed || false;
          subLevel = userData?.subLevel || 0;
          
          const planName = subLevel === 1 ? "Starter" : subLevel === 2 ? "Daily" : subLevel === 3 ? "Twice Daily" : "None";
          
          console.log("[Contact Chat] User:", {
            name: session?.user?.name || "Unknown",
            email: userEmail,
            plan: planName,
            credits: userData?.credits || 0,
            signInMethod: signInMethod,
          });
        } else {
          console.log("[Contact Chat] User doc not found for:", userEmail);
        }
      } catch (error) {
        console.error("[Contact Chat] Firebase error:", error);
        isSubscribed = session?.user?.isSubscribed || false;
        subLevel = session?.user?.subLevel || 0;
      }
    } else {
      console.log("[Contact Chat] Anonymous user (not signed in)");
    }

    const userCategory = getUserCategory(isSignedIn, isSubscribed, subLevel);
    console.log("[Contact Chat] User category:", userCategory);
    
    const systemPrompt = buildSystemPrompt(userCategory);
    console.log("[Contact Chat] System prompt length:", systemPrompt.length);

    // Build the messages array for OpenAI
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];
    
    console.log("[Contact Chat] Total messages to OpenAI:", openaiMessages.length);
    console.log("[Contact Chat] Messages being sent:", openaiMessages.map(m => ({
      role: m.role,
      contentPreview: typeof m.content === 'string' ? m.content.substring(0, 100) + (m.content.length > 100 ? '...' : '') : '[non-string]'
    })));

    // Call GPT-5 mini with streaming
    console.log("[Contact Chat] Calling OpenAI gpt-5-mini...");
    let stream;
    try {
      stream = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: openaiMessages,
        max_completion_tokens: 4096,
        stream: true,
      });
      console.log("[Contact Chat] OpenAI stream created successfully, type:", typeof stream);
    } catch (openaiError) {
      console.error("[Contact Chat] OpenAI API error:", openaiError);
      throw openaiError;
    }

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let totalChunks = 0;
    let totalContent = "";
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            totalChunks++;
            const choice = chunk.choices[0];
            const content = choice?.delta?.content || "";
            
            if (content) {
              totalContent += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          console.log("[Contact Chat] Response complete:", totalChunks, "chunks,", totalContent.length, "chars");
          controller.close();
        } catch (error) {
          console.error("[Contact Chat] Stream error:", error);
          controller.error(error);
        }
      },
    });

    console.log("[Contact Chat] Returning streaming response");
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Contact Chat] ========== ERROR ==========");
    console.error("[Contact Chat] Error details:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
