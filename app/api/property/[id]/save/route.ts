import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { adminDB } from '@/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function PUT(
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
    const body = await request.json();

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

    if (body.photos) {
      updateData.photos = body.photos;
    }

    if (body.title) {
      updateData.title = body.title;
    }

    await propertyRef.update(updateData);

    return NextResponse.json({ 
      message: 'Property saved successfully' 
    });

  } catch (error) {
    console.error('Error saving property:', error);
    return NextResponse.json(
      { error: 'Failed to save property' },
      { status: 500 }
    );
  }
}
