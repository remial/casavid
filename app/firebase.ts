import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCQsUnf-520fdiBH-SoSX6rfdyGE61HnYE",
  authDomain: "casavid1.firebaseapp.com",
  projectId: "casavid1",
  storageBucket: "casavid1.firebasestorage.app",
  messagingSenderId: "810482997112",
  appId: "1:810482997112:web:ee685a920c77cf60741a8d"
};


  async function uploadFileToFirebase(image_url: string, name: string) {
    try {
      const response = await fetch(image_url);
      const buffer = await response.arrayBuffer();
      const file_name = name.replace(/\s+/g, '') + Date.now() + ".jpeg";
      console.log("File name is: ", file_name)
      const storageRef = ref(storage, `adventure_images/${file_name}`);
      await uploadBytes(storageRef, buffer, {
        contentType: "image/jpeg",
      });
      const firebase_url = await getDownloadURL(storageRef);
      return firebase_url;
    } catch (error) {
      console.error(error);
    }
  }
  

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  //const app = initializeApp(firebaseConfig)
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app);
  const storage = getStorage(app);

  export {app, db, auth, functions, storage, uploadFileToFirebase};