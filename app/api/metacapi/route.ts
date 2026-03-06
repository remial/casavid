// app/api/metacapi/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID!
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN!

export async function POST(req: NextRequest) {
  const { email, eventName = 'Purchase', eventId, value, currency, fbp, fbc } = await req.json()

  if (!email) {
    return NextResponse.json(
      { error: 'Missing required field: email' },
      { status: 400 }
    )
  }

  // 1) Normalize & hash user email
  const normalized = email.trim().toLowerCase()
  const hashedEmail = crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex')

  // 2) Build user_data with fbp and fbc if available
  const userData: any = {
    em: hashedEmail,
  }
  
  if (fbp) userData.fbp = fbp
  if (fbc) userData.fbc = fbc

  // 3) Build FB payload
  const fbEvent = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    user_data: userData,
    custom_data: { value, currency },
  }

  try {
    const resp = await fetch(
      `https://graph.facebook.com/v17.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [fbEvent] }),
      }
    )
    const result = await resp.json()
    if (!resp.ok) {
      console.error('Facebook CAPI error:', result)
      return NextResponse.json({ error: result }, { status: resp.status })
    }
    console.log('Facebook CAPI success:', result)
    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error('Error sending to Facebook CAPI:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
