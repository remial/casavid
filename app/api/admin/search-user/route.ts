import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { adminDB } from "@/firebase-admin";

const ADMIN_EMAIL = "remialao@gmail.com";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { channelName } = await req.json();

  if (!channelName || typeof channelName !== "string") {
    return NextResponse.json({ error: "Channel name is required" }, { status: 400 });
  }

  const searchTerm = channelName.trim().toLowerCase();

  try {
    // Query all users - Firestore doesn't support case-insensitive search,
    // so we fetch users that have youtubeProfile and filter in memory
    const usersSnapshot = await adminDB.collection("users").get();

    const results: { userId: string; email: string; channelName: string }[] = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const ytChannelName = data?.youtubeProfile?.channelName;

      if (
        ytChannelName &&
        ytChannelName.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          userId: doc.id,
          email: data.email || "No email on record",
          channelName: ytChannelName,
        });
      }
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}

