import PortalNotification from '@/src/app/emails/PortalNotification';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail, changeType, changeDetails, timestamp } = await req.json();
    
    if (!userEmail || !changeType || !changeDetails || !timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: userEmail, changeType, changeDetails, timestamp" },
        { status: 400 }
      );
    }

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const data = await resend.emails.send({
      from: 'CasaVid 🏠 <hello@casavid.com>',
      to: ['aimeromailbox@gmail.com'], // Send to your specified email
      replyTo: ['aimeromailbox@gmail.com'],
      subject: `Customer Portal Activity - ${changeType}`,
      react: PortalNotification({
        userEmail,
        changeType,
        changeDetails,
        timestamp,
      }),
    });

    console.log("Portal notification email sent successfully to aimeromailbox@gmail.com");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending portal notification email:", error);
    return NextResponse.json({ error: "Failed to send notification email" }, { status: 500 });
  }
}
