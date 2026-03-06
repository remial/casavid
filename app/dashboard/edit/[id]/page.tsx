import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc } from "firebase/firestore";
import PropertyEditor from "@/components/casavid/PropertyEditor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function EditPropertyPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  if (!userId) {
    redirect('/');
  }

  const propertyRef = doc(db, "users", userId, "properties", params.id);
  const propertyDoc = await getDoc(propertyRef);

  if (!propertyDoc.exists()) {
    notFound();
  }

  const data = propertyDoc.data();
  const property = {
    id: propertyDoc.id,
    ...data,
    createdAt: data?.createdAt ? {
      seconds: data.createdAt.seconds || 0,
      nanoseconds: data.createdAt.nanoseconds || 0
    } : undefined,
    updatedAt: data?.updatedAt ? {
      seconds: data.updatedAt.seconds || 0,
      nanoseconds: data.updatedAt.nanoseconds || 0
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Property Video</h1>
        </div>

        <PropertyEditor property={property as any} userId={userId} />
      </div>
    </div>
  );
}
