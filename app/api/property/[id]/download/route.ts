import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { adminDB } from '@/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const propertyId = params.id;

    const propertyRef = adminDB
      .collection('users')
      .doc(userId)
      .collection('properties')
      .doc(propertyId);

    const propertyDoc = await propertyRef.get();
    if (!propertyDoc.exists) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const data = propertyDoc.data();
    const videoUrl = data?.videoUrl;

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Fetch the video from Firebase Storage
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
    }

    const videoBuffer = await response.arrayBuffer();
    const title = data?.title || `${data?.propertyType || 'property'}-${data?.bedrooms || ''}bed`;
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');

    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${sanitizedTitle}.mp4"`,
        'Content-Length': String(videoBuffer.byteLength),
      },
    });

  } catch (error) {
    console.error('[Download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to download video' },
      { status: 500 }
    );
  }
}
