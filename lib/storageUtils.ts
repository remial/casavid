import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { format } from "date-fns";

/**
 * Uploads a file buffer to Firebase Storage and returns the download URL.
 * @param fileBuffer - The file buffer to be uploaded.
 * @param userId - The user ID to organize the file storage path.
 * @param fileName - The name of the file being uploaded (optional).
 * @returns The download URL of the uploaded file.
 */
export async function uploadToStorage(fileBuffer: Buffer, userId: string, fileName: string): Promise<string> {
  try {
    // Get the current date
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    // Construct the storage path `final_video/userId/currentDate/filename`
    const storage = getStorage();
    const fullFileName = `final_video/${userId}/${currentDate}/${fileName}`;
    const storageRef = ref(storage, fullFileName);

    // Upload the file to Firebase Storage
    const metadata = {
      contentType: 'video/mp4',
    };
    await uploadBytes(storageRef, fileBuffer, metadata);

    // Get the download URL of the uploaded file
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Failed to upload the file to Firebase Storage:", error);
    throw new Error("Failed to upload the file to Firebase Storage");
  }
}
