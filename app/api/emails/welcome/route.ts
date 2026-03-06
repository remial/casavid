import WelcomeEmail from '@/src/app/emails/Welcome';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail } = await req.json();
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const data = await resend.emails.send({
      from: 'CasaVid 🏠 <hello@casavid.com>',
      to: [userEmail],
      replyTo: ['aimeromailbox@gmail.com'],
      subject: 'Welcome to CasaVid 🏠',
      react: WelcomeEmail(),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
