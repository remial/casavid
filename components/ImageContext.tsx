import React, { createContext, useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { storage } from "@/firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";

// Define the image interface
interface Image {
    name: string;
    url: string;
}

export const ImageContext = createContext<{
    images: Image[];
    fetchImages?: (userId: string) => Promise<void>;
}>({ images: [] });

interface ImageProviderProps {
    children: React.ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
    const { data: session } = useSession();
    const [images, setImages] = useState<Image[]>([]);

    useEffect(() => {
        console.log("useEffect triggered, session data:", session);
        if (session?.user?.id) {
            console.log("Fetching images for user ID:", session.user.id);
            fetchImages(session.user.id);
        }
    }, [session]);

    const fetchImages = async (userId: string) => {
        console.log("fetchImages called with userId:", userId);
        try {
            const imagesRef = ref(storage, `user_images/${userId}`);
            const imageFiles = await listAll(imagesRef);
            console.log("Fetched image files:", imageFiles);

            const imageUrls: Image[] = await Promise.all(
                imageFiles.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    console.log("Image URL for", itemRef.name, ":", url);
                    return { name: itemRef.name, url };
                })
            );

            console.log("Setting images state with:", imageUrls);
            setImages(imageUrls);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    return (
        <ImageContext.Provider value={{ images }}>
            {children}
        </ImageContext.Provider>
    );
};
