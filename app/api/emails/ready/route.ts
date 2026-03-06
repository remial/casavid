//app/api/emails/ready/route.ts
import ReadyEmail from '@/src/app/emails/Ready';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { seriesId, userEmail, videoType } = await req.json(); // Extract seriesId, userEmail, and videoType from the request body
    
    // Determine the correct video page URL based on video type
    let videoPageUrl: string;
    if (videoType === 'extended') {
      videoPageUrl = `https://www.vidnarrate.com/extended/${seriesId}`;
    } else {
      // Default to dashboard/series for backwards compatibility
      videoPageUrl = `https://www.vidnarrate.com/series/${seriesId}`;
    }

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const data = await resend.emails.send({
      from: 'VidNarrate 🚀 <hello@vidnarrate.com>',
      to: [userEmail], // Use the dynamic user email from the request body
      subject: 'Your Video is Ready ✨',
      react: ReadyEmail({ videoPageUrl }), // Pass the correct video page URL
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
