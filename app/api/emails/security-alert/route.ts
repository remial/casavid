// app/api/emails/security-alert/route.ts
// Admin notification when a potential XSS/injection attack is blocked
// Rate limited: max 1 email per 1 hour

import SecurityAlertEmail from '@/src/app/emails/SecurityAlert';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminDB } from '@/firebase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limit: 1 hour in milliseconds (more frequent than video-failed since security is critical)
const RATE_LIMIT_MS = 1 * 60 * 60 * 1000;
const ADMIN_EMAIL = 'aimeromailbox@gmail.com';

export async function POST(req: Request) {
  try {
    const { userId, userEmail, maliciousInput, inputType } = await req.json();
    
    // Check rate limit using Firestore
    const rateLimitRef = adminDB.collection('system').doc('security-alert-notifications');
    const rateLimitDoc = await rateLimitRef.get();
    
    const now = Date.now();
    const lastNotificationTime = rateLimitDoc.exists 
      ? rateLimitDoc.data()?.lastNotificationTime || 0 
      : 0;
    
    // Check if 1 hour has passed since last notification
    if (now - lastNotificationTime < RATE_LIMIT_MS) {
      const timeRemaining = Math.ceil((RATE_LIMIT_MS - (now - lastNotificationTime)) / (60 * 1000));
      console.log(`[security-alert] Rate limited. Next notification allowed in ${timeRemaining} minutes.`);
      
      // Still log the attempt even if rate limited
      await logSecurityAttempt(userId, userEmail, maliciousInput, inputType);
      
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
    
    // Log the attempt to Firestore for record keeping
    await logSecurityAttempt(userId, userEmail, maliciousInput, inputType);
    
    // Send email to admin
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });
    
    // Truncate malicious input for email (keep full version in logs)
    const truncatedInput = maliciousInput.length > 500 
      ? maliciousInput.substring(0, 500) + '...[truncated]' 
      : maliciousInput;
    
    const data = await resend.emails.send({
      from: 'CasaVid Security 🛡️ <hello@send.casavid.com>',
      replyTo: ['aimeromailbox@gmail.com'],
      to: [ADMIN_EMAIL],
      subject: `🛡️ Security Alert - ${userEmail}`,
      react: SecurityAlertEmail({ 
        userId, 
        userEmail, 
        maliciousInput: truncatedInput, 
        inputType: inputType || 'custom prompt',
        timestamp
      }),
    });

    console.log(`[security-alert] Admin notification sent for user ${userId} (${userEmail})`);
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('[security-alert] Error sending notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Log all security attempts to Firestore (even rate-limited ones)
async function logSecurityAttempt(
  userId: string, 
  userEmail: string, 
  maliciousInput: string, 
  inputType: string
) {
  try {
    const logsRef = adminDB.collection('security-logs');
    await logsRef.add({
      userId,
      userEmail,
      maliciousInput: maliciousInput.substring(0, 2000), // Limit stored size
      inputType,
      timestamp: new Date(),
      blocked: true
    });
  } catch (error) {
    console.error('[security-alert] Failed to log attempt:', error);
  }
}
