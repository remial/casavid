// lib/genwords.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/firebase"; 
import { doc, getDoc } from "firebase/firestore";

export async function getUserGenWords() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    //console.log("User session is invalid or lacks an email, hence cannot determine subscription status.");
    return false;
  }

  const userRef = doc(db, 'users', session.user.id); 
  const dbUserSnap = await getDoc(userRef);

  if (!dbUserSnap.exists()) {
    //console.log(`User document for ID ${session.user.id} does not exist.`);
    return false;
  }

  const userData = dbUserSnap.data();  // Access the document data
  const userGenwords = userData.aiwordcount;  // Assume 'aiwordcount' is a field in the user document

 

  return userGenwords;
}
