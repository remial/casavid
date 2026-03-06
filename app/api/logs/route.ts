import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const temporarilyUnavailable = false;

export async function POST(request: Request) {
  if (temporarilyUnavailable) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const { message } = await request.json();
  

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  console.log(message);

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
