import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { adminDB } from '@/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const log = (msg: string) => console.log(`[CasaVid Generate] ${msg}`);
  
  try {
    log(`Starting video generation request...`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      log(`ERROR: Unauthorized - no session`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const propertyId = params.id;
    log(`User: ${userId}, Property: ${propertyId}`);

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

    const property = propertyDoc.data();
    log(`Property loaded: ${property?.photos?.length || 0} photos, ${property?.videoLength}s video, voice: ${property?.voiceStyle}`);

    if (property?.status === 'processing') {
      log(`ERROR: Video already processing`);
      return NextResponse.json(
        { error: 'Video is already being processed' },
        { status: 400 }
      );
    }

    log(`Updating status to 'processing'...`);
    await propertyRef.update({
      status: 'processing',
      updatedAt: Timestamp.now(),
    });

    const ffmpegApiUrl = process.env.FFMPEG_API_URL;
    if (!ffmpegApiUrl) {
      log(`WARNING: FFMPEG_API_URL not configured - using simulation mode`);
      
      setTimeout(async () => {
        try {
          await propertyRef.update({
            status: 'ready',
            videoUrl: 'https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/housevid.mp4',
            updatedAt: Timestamp.now(),
          });
          log(`Simulation complete - status updated to ready`);
        } catch (err) {
          console.error('[CasaVid Generate] Simulation error:', err);
        }
      }, 10000);

      return NextResponse.json({
        message: 'Video generation started (simulation mode)',
        propertyId,
      });
    }

    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/property/webhook/video-ready`;
    log(`Webhook URL: ${webhookUrl}`);
    
    const ffmpegPayload = {
      propertyId,
      userId,
      webhookUrl,
      photos: property?.photos || [],
      settings: {
        videoLength: property?.videoLength || 60,
        voiceStyle: property?.voiceStyle || 'professional-male',
        propertyDetails: {
          type: property?.propertyType,
          bedrooms: property?.bedrooms,
          bathrooms: property?.bathrooms,
          highlights: property?.highlights,
        },
      },
    };

    log(`Sending request to DO server: ${ffmpegApiUrl}/generate-casavid-video`);
    log(`Payload: ${ffmpegPayload.photos.length} photos, ${ffmpegPayload.settings.videoLength}s, ${ffmpegPayload.settings.voiceStyle}`);
    
    try {
      const fetchStart = Date.now();
      const response = await fetch(`${ffmpegApiUrl}/generate-casavid-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FFMPEG_API_KEY || ''}`,
        },
        body: JSON.stringify(ffmpegPayload),
      });

      const fetchTime = Date.now() - fetchStart;
      log(`DO server responded in ${fetchTime}ms with status ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        log(`ERROR: DO server returned ${response.status}: ${errorText}`);
        throw new Error(`FFmpeg API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const totalTime = Date.now() - startTime;
      log(`SUCCESS: Job queued - jobId: ${result.jobId}, estimatedTime: ${result.estimatedTime}s, total API time: ${totalTime}ms`);

      return NextResponse.json({
        message: 'Video generation started',
        propertyId,
        jobId: result.jobId,
        estimatedTime: result.estimatedTime,
      });

    } catch (ffmpegError) {
      const errorMsg = ffmpegError instanceof Error ? ffmpegError.message : 'Unknown error';
      log(`ERROR: FFmpeg API call failed - ${errorMsg}`);
      
      await propertyRef.update({
        status: 'failed',
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json(
        { error: 'Failed to start video generation' },
        { status: 500 }
      );
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CasaVid Generate] ERROR: ${errorMsg}`);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
