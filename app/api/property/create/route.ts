import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { adminDB, storage } from '@/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check user credits and subscription status
    const userRef = adminDB.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    const credits = userData?.credits || 0;
    const isSubscribed = userData?.isSubscribed || false;

    // If user has no credits and is not subscribed, return error
    if (credits <= 0 && !isSubscribed) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        message: 'You need credits to create a video. Please purchase credits to continue.',
        redirectTo: '/pricing'
      }, { status: 402 });
    }

    // If user has no credits even if subscribed, they still need credits
    if (credits <= 0) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        message: 'You have run out of credits. Please purchase more credits to continue.',
        redirectTo: '/pricing'
      }, { status: 402 });
    }

    const formData = await request.formData();

    const propertyType = formData.get('propertyType') as string;
    const bedrooms = formData.get('bedrooms') as string;
    const bathrooms = formData.get('bathrooms') as string;
    const highlights = formData.get('highlights') as string;
    const videoLength = parseInt(formData.get('videoLength') as string) || 60;
    const voiceStyle = formData.get('voiceStyle') as string;

    const photos: Array<{ url: string; order: number; caption: string; duration: number }> = [];
    
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      console.error('FIREBASE_STORAGE_BUCKET environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const bucket = storage.bucket(bucketName);

    let photoIndex = 0;
    while (formData.has(`photo_${photoIndex}`)) {
      const file = formData.get(`photo_${photoIndex}`) as File;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `properties/${userId}/${Date.now()}_${photoIndex}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        const fileRef = bucket.file(fileName);
        await fileRef.save(buffer, {
          metadata: {
            contentType: file.type,
          },
        });

        await fileRef.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        photos.push({
          url: publicUrl,
          order: photoIndex,
          caption: '',
          duration: Math.floor(videoLength / Math.max(1, photoIndex + 1)),
        });
      }
      photoIndex++;
    }

    if (photos.length === 0) {
      return NextResponse.json({ error: 'No photos uploaded' }, { status: 400 });
    }

    const defaultDuration = Math.floor(videoLength / photos.length);
    photos.forEach((photo, index) => {
      photo.duration = defaultDuration;
      photo.order = index;
    });

    const propertyData = {
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'draft' as const,
      propertyType,
      bedrooms,
      bathrooms,
      highlights,
      videoLength,
      voiceStyle,
      photos,
      title: `${propertyType} - ${bedrooms} bed`,
    };

    const propertyRef = await adminDB
      .collection('users')
      .doc(userId)
      .collection('properties')
      .add(propertyData);

    // Deduct 1 credit from the user
    await userRef.update({
      credits: FieldValue.increment(-1)
    });

    return NextResponse.json({ 
      propertyId: propertyRef.id,
      message: 'Property created successfully' 
    });

  } catch (error) {
    console.error('Error creating property:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to create property', details: errorMessage },
      { status: 500 }
    );
  }
}
