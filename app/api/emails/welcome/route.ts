import WelcomeEmail from '@/src/app/emails/Welcome';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail } = await req.json();
    console.log("[Welcome Email] Attempting to send to:", userEmail);
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const { data, error } = await resend.emails.send({
      from: 'CasaVid 🏠 <hello@casavid.com>',
      to: [userEmail],
      replyTo: ['aimeromailbox@gmail.com'],
      subject: 'Welcome to CasaVid 🏠',
      react: WelcomeEmail(),
    });

    if (error) {
      console.error("[Welcome Email] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[Welcome Email] Successfully sent, ID:", data?.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Welcome Email] Exception:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
