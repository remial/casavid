// app/api/snapcapi/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

const PIXEL_ID = '4fec6043-1a8d-49a2-8d68-5f8f4454425d'
const ACCESS_TOKEN = process.env.SNAPCHAT_ACCESS_TOKEN!

export async function POST(req: NextRequest) {
  const { email, eventName = 'PURCHASE', eventId, price, currency = 'USD' } = await req.json()

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

  // 2) Build Snapchat CAPI payload
  const snapEvent = {
    pixel_id: PIXEL_ID,
    event_conversion_type: eventName,
    event_type: 'OFFLINE',
    timestamp: Date.now(),
    event_tag: eventId || crypto.randomUUID(),
    hashed_email: hashedEmail,
    ...(price && { price: price.toString() }),
    ...(currency && { currency }),
  }

  try {
    const resp = await fetch(
      'https://tr.snapchat.com/v2/conversion',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          data: [snapEvent]
        }),
      }
    )
    
    const result = await resp.json()
    
    if (!resp.ok) {
      console.error('Snapchat CAPI error:', result)
      return NextResponse.json({ error: result }, { status: resp.status })
    }
    
    console.log('Snapchat CAPI success:', result)
    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error('Error sending to Snapchat CAPI:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


