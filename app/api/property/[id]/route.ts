import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { adminDB, storage } from '@/firebase-admin';

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

    return NextResponse.json({
      id: propertyDoc.id,
      ...propertyDoc.data(),
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (property?.photos && Array.isArray(property.photos)) {
      const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
      
      for (const photo of property.photos) {
        try {
          const url = new URL(photo.url);
          const filePath = url.pathname.replace(`/${bucket.name}/`, '');
          await bucket.file(filePath).delete();
        } catch (err) {
          console.warn('Failed to delete photo:', err);
        }
      }
    }

    await propertyRef.delete();

    return NextResponse.json({
      message: 'Property deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
