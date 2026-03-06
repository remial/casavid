import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const log = (msg: string) => console.log(`[CasaVid Webhook] ${msg}`);
  
  try {
    log(`Received webhook callback`);
    
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.WEBHOOK_SECRET_KEY;
    
    if (expectedApiKey && apiKey !== expectedApiKey) {
      log(`ERROR: Unauthorized - invalid API key`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, userId, status, videoUrl, thumbnailUrl, error: errorMessage } = body;
    log(`Property: ${propertyId}, User: ${userId}, Status: ${status}`);

    if (!propertyId || !userId) {
      log(`ERROR: Missing propertyId or userId`);
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

    log(`Fetching property from Firestore...`);
    const propertyDoc = await propertyRef.get();
    if (!propertyDoc.exists) {
      log(`ERROR: Property not found`);
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (status === 'ready' && videoUrl) {
      log(`SUCCESS: Video ready - ${videoUrl}`);
      updateData.status = 'ready';
      updateData.videoUrl = videoUrl;
      if (thumbnailUrl) {
        updateData.thumbnailUrl = thumbnailUrl;
      }

      const userDoc = await adminDB.collection('users').doc(userId).get();
      const userEmail = userDoc.data()?.email;
      
      if (userEmail) {
        log(`Sending success email to ${userEmail}`);
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
          log(`Email sent successfully`);
        } catch (emailError) {
          log(`WARNING: Failed to send email - ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
        }
      }
    } else if (status === 'failed') {
      log(`FAILED: Video generation failed - ${errorMessage}`);
      updateData.status = 'failed';
      updateData.errorMessage = errorMessage || 'Video generation failed';

      const userRef = adminDB.collection('users').doc(userId);
      await userRef.update({
        credits: FieldValue.increment(1)
      });
      log(`Refunded 1 credit to user ${userId}`);

      const userDoc = await userRef.get();
      const userEmail = userDoc.data()?.email;
      
      if (userEmail) {
        log(`Sending failure email to ${userEmail}`);
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
          log(`Failure email sent`);
        } catch (emailError) {
          log(`WARNING: Failed to send failure email - ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
        }
      }
    } else {
      log(`ERROR: Invalid status '${status}' or missing videoUrl`);
      return NextResponse.json(
        { error: 'Invalid status or missing videoUrl' },
        { status: 400 }
      );
    }

    log(`Updating property status in Firestore...`);
    await propertyRef.update(updateData);

    const totalTime = Date.now() - startTime;
    log(`Webhook processed successfully in ${totalTime}ms`);

    return NextResponse.json({
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CasaVid Webhook] ERROR: ${errorMsg}`);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
