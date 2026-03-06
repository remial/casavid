import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from 'next/navigation';
import { adminDB } from '@/firebase-admin';
import VideoViewer from "@/components/casavid/VideoViewer";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function ViewPropertyPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  if (!userId) {
    redirect('/');
  }

  const propertyRef = adminDB
    .collection('users')
    .doc(userId)
    .collection('properties')
    .doc(params.id);
    
  const propertyDoc = await propertyRef.get();

  if (!propertyDoc.exists) {
    notFound();
  }

  const data = propertyDoc.data();
  
  if (data?.status !== 'ready' || !data?.videoUrl) {
    redirect(`/dashboard/edit/${params.id}`);
  }

  const title = data.title || `${data.propertyType || 'Property'} - ${data.bedrooms || '?'} bed`;

  return (
    <VideoViewer
      videoUrl={data.videoUrl}
      title={title}
      propertyId={params.id}
      bedrooms={data.bedrooms || '?'}
      bathrooms={data.bathrooms || '?'}
      propertyType={data.propertyType || 'Property'}
      videoLength={data.videoLength || 60}
      highlights={data.highlights}
      thumbnailUrl={data.thumbnailUrl || data.photos?.[0]?.url}
    />
  );
}
