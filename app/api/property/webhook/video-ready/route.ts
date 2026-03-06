import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.WEBHOOK_SECRET_KEY;
    
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, userId, status, videoUrl, thumbnailUrl, error: errorMessage } = body;

    if (!propertyId || !userId) {
      return NextResponse.json(
        { error: 'Missing propertyId or userId' },
        { status: 400 }
      );
    }

    const propertyRef = adminDB
      .collection('users')
      .doc(userId)
      .collection('properties')
      .doc(propertyId);

    const propertyDoc = await propertyRef.get();
    if (!propertyDoc.exists) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (status === 'ready' && videoUrl) {
      updateData.status = 'ready';
      updateData.videoUrl = videoUrl;
      if (thumbnailUrl) {
        updateData.thumbnailUrl = thumbnailUrl;
      }

      const userDoc = await adminDB.collection('users').doc(userId).get();
      const userEmail = userDoc.data()?.email;
      
      if (userEmail) {
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/emails/ready`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              propertyId,
              videoUrl,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }
    } else if (status === 'failed') {
      updateData.status = 'failed';
      updateData.errorMessage = errorMessage || 'Video generation failed';

      const userDoc = await adminDB.collection('users').doc(userId).get();
      const userEmail = userDoc.data()?.email;
      
      if (userEmail) {
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/emails/video-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              propertyId,
              error: errorMessage,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send failure email:', emailError);
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid status or missing videoUrl' },
        { status: 400 }
      );
    }

    await propertyRef.update(updateData);

    return NextResponse.json({
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
