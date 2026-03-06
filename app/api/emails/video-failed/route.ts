// app/api/emails/video-failed/route.ts
// Admin notification when a customer's video fails
// Rate limited: max 1 email per 4 hours

import VideoFailedEmail from '@/src/app/emails/VideoFailed';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminDB } from '@/firebase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limit: 4 hours in milliseconds
const RATE_LIMIT_MS = 4 * 60 * 60 * 1000;
const ADMIN_EMAIL = 'aimeromailbox@gmail.com';

export async function POST(req: Request) {
  try {
    const { userId, userEmail, errorMessage, videoType } = await req.json();
    
    // Check rate limit using Firestore
    const rateLimitRef = adminDB.collection('system').doc('video-failed-notifications');
    const rateLimitDoc = await rateLimitRef.get();
    
    const now = Date.now();
    const lastNotificationTime = rateLimitDoc.exists 
      ? rateLimitDoc.data()?.lastNotificationTime || 0 
      : 0;
    
    // Check if 4 hours have passed since last notification
    if (now - lastNotificationTime < RATE_LIMIT_MS) {
      const timeRemaining = Math.ceil((RATE_LIMIT_MS - (now - lastNotificationTime)) / (60 * 1000));
      console.log(`[video-failed] Rate limited. Next notification allowed in ${timeRemaining} minutes.`);
      return NextResponse.json({ 
        success: false, 
        rateLimited: true,
        message: `Rate limited. Next notification in ${timeRemaining} minutes.`
      });
    }
    
    // Update the last notification time BEFORE sending (to prevent race conditions)
    await rateLimitRef.set({ 
      lastNotificationTime: now,
      lastUserId: userId,
      lastUserEmail: userEmail
    }, { merge: true });
    
    // Send email to admin only
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });
    
    const data = await resend.emails.send({
      from: 'CasaVid Alerts 🚨 <hello@casavid.com>',
      replyTo: ['aimeromailbox@gmail.com'],
      to: [ADMIN_EMAIL],
      subject: `🚨 Video Failed - ${userEmail}`,
      react: VideoFailedEmail({ 
        userId, 
        userEmail, 
        errorMessage: errorMessage || 'Unknown error', 
        videoType: videoType || 'dashboard',
        timestamp
      }),
    });

    console.log(`[video-failed] Admin notification sent for user ${userId} (${userEmail})`);
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('[video-failed] Error sending notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

