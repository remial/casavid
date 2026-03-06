// hooks/useCheckCredit.ts
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Adjust this import to match your Firebase configuration setup
import { useSession } from 'next-auth/react';

export const useCheckCredit = () => {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      if (session?.user?.id) { // Assuming you use email as the key to user's document
        const userRef = doc(db, `users/${session.user.id}`);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userCredits = userSnap.data().credits;
            setCredits(userCredits);
          } else {
            // User document does not exist; could be considered an error state
            // For simplicity, we're just setting credits to null
            setCredits(null);
          }
        } catch (error) {
          console.error("Failed to fetch user credits:", error);
          // Handle error (e.g., by setting credits to null to indicate an error or loading state)
          setCredits(null);
        }
      } else {
        // No session/user found; could also be considered an error or not logged in state
        setCredits(null);
      }
    };

    fetchCredits();
  }, [session]);
  console.log("Remaining credits :", credits)
  return credits;
};
