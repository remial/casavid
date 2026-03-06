import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function uploadFileToFirebase(image_url: string, name: string) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await fetch(image_url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const file_name = name.replace(/\s/g, "") + Date.now() + ".jpeg";
    console.log("Storage file name is: ", file_name)
    const storageRef = ref(storage, `story_images/${file_name}`);
    await uploadBytes(storageRef, blob, {
      contentType: "image/jpeg",
    });
    const firebase_url = await getDownloadURL(storageRef);
    return firebase_url;
  } catch (error) {
    console.error(error);
    throw error;  // Re-throw the error so that the caller function is aware of it.
  }
}