// app/api/emails/pause/route.ts
import PauseEmail from "@/src/app/emails/Pause";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail } = await req.json(); // Extract userEmail from the request body

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const data = await resend.emails.send({
      from: "CasaVid 🏠 <hello@send.casavid.com>",
      to: [userEmail],
      bcc: ["aimeromailbox@gmail.com"],                    // Dynamic recipient
      replyTo: ["aimeromailbox@gmail.com"], // Updated support address
      subject: "Your Latest Payment 😎",
      react: PauseEmail(),
      text: `
Hey there,

It looks like your latest payment didn’t go through. 
No worries, it does happen. It might be the bank having a short nap.

Your CasaVid video generation is on pause for now.

To get things rolling again, we'll retry soon. Or you can pick a plan on our: Pricing Page

If you have questions or need a hand, please drop us a line at Customer Support. 😊

You always have access to Customer Support every day of the week and even on weekends.

Cheers,

The CasaVid Team
      `,
      headers: {
        "List-Unsubscribe": "<mailto:aimeromailbox@gmail.com>"
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}