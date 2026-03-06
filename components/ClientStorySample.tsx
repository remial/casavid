"use client";
import { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import UpgradeButtonVideo from "./UpgradeButtonVideo";
import axios from "axios";
import { signIn } from "next-auth/react";

interface ClientStorySampleProps {
  session: any; // Accept session as a prop
}

const ClientStorySample: React.FC<ClientStorySampleProps> = ({ session }) => {
  const [isSubscribed, setIsSubscribed] = useState(false); // State for subscription status
  const [loading, setLoading] = useState(true); // State for loading

  const videos = [
    { id: 1, url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/AnacondaJaguar.mp4" },
    { id: 2, url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/ToddlerTantrum.mp4" },
    { id: 3, url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/IceFloats.mp4" },
  ];

  const videoRefs = useRef<HTMLVideoElement[]>([]);

  const handlePlay = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause();
      }
    });
  };

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true); // Start loading
        if (session) {
          const response = await axios.get("/api/checksocialyt"); // Adjust endpoint as necessary
          setIsSubscribed(response.data.isSubscribed || false); // Update subscription status
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchSubscriptionStatus();
  }, [session]);

  return (
    <div className="min-h-screen grainy p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8 text-center text-blue-600">Sample Videos</h1>
      {loading ? (
        <p>Loading...</p> // Display a loading indicator while checking subscription
      ) : (
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {videos.map((video, index) => (
            <div key={video.id} className="relative flex flex-col items-center">
              <video
                controls
                controlsList="nodownload" // Prevent download option in supported browsers
                className="rounded-lg w-full lg:w-3/4"
                ref={(el) => {
                  if (el) videoRefs.current[index] = el; // Assign to the ref array
                }}
                onPlay={() => handlePlay(index)}
                onContextMenu={(e) => e.preventDefault()} // Prevent right-click context menu
              >
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {!session && ( // Show Sign Up button for users without a session
                <div className="mt-4">
                  <Button
                    className="hover:scale-110 transition duration-300 ease-in-out rounded-full text-xl"
                    style={{ backgroundColor: "blue", color: "white" }}
                    onClick={() => signIn()}
                  >
                    Sign Up - For Free
                  </Button>
                </div>
              )}
              {session && !isSubscribed && ( // Show UpgradeButtonVideo only if signed in and not subscribed
                <div className="mt-4">
                  <UpgradeButtonVideo />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientStorySample;
