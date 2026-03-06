import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from '@/firebase';
import { ArrowLeft, Coins, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { getDocs, collection, query, orderBy, where, deleteDoc, doc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from 'next/navigation';
import PropertyGrid from "@/components/casavid/PropertyGrid";
import { MAINTENANCE_MODE, MAINTENANCE_MESSAGE } from "@/lib/config";
import GTagSignup from "@/components/GTagSignup";

export type Property = {
  id: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
  status: 'draft' | 'processing' | 'ready' | 'failed';
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  highlights: string;
  videoLength: number;
  voiceStyle: string;
  photos: Array<{ url: string; order: number; caption: string; duration: number }>;
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
};

export const dynamic = 'force-dynamic';

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const isSubscribed = session?.user?.isSubscribed ?? false;
  const credits = session?.user?.credits ?? 0;
  
  if (!userId) {
    redirect('/');
  }
  
  const showMaintenance = MAINTENANCE_MODE && isSubscribed;

  // Cleanup failed videos older than 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const propertiesRef = collection(db, "users", userId, "properties");
  
  try {
    const failedQuery = query(
      propertiesRef,
      where("status", "==", "failed")
    );
    const failedSnapshot = await getDocs(failedQuery);
    
    const deletePromises: Promise<void>[] = [];
    failedSnapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const createdAt = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null;
      
      if (createdAt && createdAt < twoHoursAgo) {
        deletePromises.push(deleteDoc(doc(db, "users", userId, "properties", docSnapshot.id)));
      }
    });
    
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`Cleaned up ${deletePromises.length} old failed video(s) for user ${userId}`);
    }
  } catch (error) {
    console.error('Error cleaning up old failed videos:', error);
  }

  const q = query(propertiesRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  const properties: Property[] = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: {
        seconds: data.createdAt?.seconds || 0,
        nanoseconds: data.createdAt?.nanoseconds || 0
      },
      updatedAt: data.updatedAt ? {
        seconds: data.updatedAt.seconds || 0,
        nanoseconds: data.updatedAt.nanoseconds || 0
      } : undefined
    } as Property;
  });

  return (
    <>
      <GTagSignup />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">My Property Videos</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {isSubscribed && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-amber-700">{credits}</span>
                </div>
              )}
              <Link href="/dashboard/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Plus className="w-5 h-5" />
                  Create Property Video
                </Button>
              </Link>
            </div>
          </div>

          {showMaintenance && (
            <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-6 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold text-lg">{MAINTENANCE_MESSAGE.title}</p>
                  <p className="text-sm">{MAINTENANCE_MESSAGE.description}</p>
                </div>
              </div>
            </div>
          )}

          <Separator className="mb-6" />
          
          {properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-xl text-gray-600 mb-2">No property videos yet</h2>
              <p className="text-gray-500 mb-6">Upload photos and create your first property walkthrough video</p>
              <Link href="/dashboard/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Video
                </Button>
              </Link>
            </div>
          ) : (
            <Suspense fallback={
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            }>
              <PropertyGrid properties={properties} />
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
