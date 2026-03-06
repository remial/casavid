// hooks/useCheckSession.ts
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { useSession } from 'next-auth/react';

export const useCheckSession = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    if (status !== 'loading') {
      if (session) {
        setLoading(false);
      }
      
    }
  }, [session, status]);

  return { loading };
};