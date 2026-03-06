// hooks/useGenWords.ts
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase'; // Adjust this import to match your Firebase configuration setup
import { useSession } from 'next-auth/react';

export const useGenWords = () => {
  const { data: session } = useSession();
  const [aiwords, setAiwords] = useState<number | null>(null);

  useEffect(() => {
    const fetchAiwords = async () => {
      if (session?.user?.id) { // Assuming you use email as the key to user's document
        const userRef = doc(db, `users/${session.user.id}`);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            let { aiwordcount, ailastgen } = userData || {};
            aiwordcount = aiwordcount || 0;
            ailastgen = ailastgen ? ailastgen.toDate() : new Date(0); // Default to epoch if undefined

            const now = Timestamp.now();
            const nowMs = now.toDate().getTime();
            const ailastgenMs = ailastgen.getTime();

            // Check if 24 hours have passed
            if (nowMs - ailastgenMs >= 86400000) {
              aiwordcount = 0;
              await updateDoc(userRef, {
                aiwordcount: 0,
                ailastgen: now,
              });
            }

           // console.log("From hook ai word count is: ", aiwordcount)

            setAiwords(aiwordcount);
          } else {
            // User document does not exist; could be considered an error state
            // For simplicity, we're just setting credits to null
            //console.log("Path1")
            setAiwords(null);
          }
        } catch (error) {
          console.error("Failed to fetch AI word count:", error);
          // Handle error (e.g., by setting credits to null to indicate an error or loading state)
          //console.log("Path2")
          setAiwords(null);
        }
      } else {
        // No session/user found; could also be considered an error or not logged in state
        //console.log("Path3")
        setAiwords(null);
      }
    };

    fetchAiwords();
  }, [session]);
  
  console.log("AI word Counter:", aiwords);
  return aiwords;
};
