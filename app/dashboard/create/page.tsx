import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from 'next/navigation';
import CreatePropertyForm from "@/components/casavid/CreatePropertyForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function CreatePropertyPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  if (!userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Property Video</h1>
        </div>

        <CreatePropertyForm userId={userId} />
      </div>
    </div>
  );
}
