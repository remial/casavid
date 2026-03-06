import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { adminDB } from '@/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(
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

    const property = propertyDoc.data();

    if (property?.status === 'processing') {
      return NextResponse.json(
        { error: 'Video is already being processed' },
        { status: 400 }
      );
    }

    await propertyRef.update({
      status: 'processing',
      updatedAt: Timestamp.now(),
    });

    const ffmpegApiUrl = process.env.FFMPEG_API_URL;
    if (!ffmpegApiUrl) {
      console.warn('FFMPEG_API_URL not configured - video generation will be simulated');
      
      setTimeout(async () => {
        try {
          await propertyRef.update({
            status: 'ready',
            videoUrl: 'https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/housevid.mp4',
            updatedAt: Timestamp.now(),
          });
        } catch (err) {
          console.error('Error updating property status:', err);
        }
      }, 10000);

      return NextResponse.json({
        message: 'Video generation started (simulation mode)',
        propertyId,
      });
    }

    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/property/webhook/video-ready`;
    
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

    try {
      const response = await fetch(`${ffmpegApiUrl}/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FFMPEG_API_KEY || ''}`,
        },
        body: JSON.stringify(ffmpegPayload),
      });

      if (!response.ok) {
        throw new Error(`FFmpeg API returned ${response.status}`);
      }

      return NextResponse.json({
        message: 'Video generation started',
        propertyId,
      });

    } catch (ffmpegError) {
      console.error('FFmpeg API error:', ffmpegError);
      
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
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
