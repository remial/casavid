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
    
    return NextResponse.json({
      status: data?.status || 'draft',
      videoUrl: data?.videoUrl || null,
      thumbnailUrl: data?.thumbnailUrl || null,
      errorMessage: data?.errorMessage || null,
    });

  } catch (error) {
    console.error('[CasaVid Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
