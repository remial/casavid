"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function TestButton() {
  const [userEmail, setUserEmail] = useState("test@example.com");
  const [videoPageUrl, setVideoPageUrl] = useState("https://example.com/video-page");

  const handleSendEmail = async () => {
    if (!userEmail || !videoPageUrl) {
      alert("Please provide both email and video URL.");
      return;
    }

    try {
      const response = await fetch('/api/emailsready', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          videoPageUrl,
        }),
      });

      if (response.ok) {
        alert("Email sent successfully!");
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred while sending the email.");
    }
  };

  return (
    <main>
      <Link href="/">
        <Button className="bg-fuchsia-700 ml-auto text-white" size="sm">
          <ArrowLeft className="mr-1 w-4 h-4 text-white" />
          Home
        </Button>
      </Link>

      <div className="mt-4">
        <input
          type="email"
          placeholder="Enter recipient's email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className="border border-gray-300 p-2 mr-2"
        />
        <input
          type="url"
          placeholder="Enter video page URL"
          value={videoPageUrl}
          onChange={(e) => setVideoPageUrl(e.target.value)}
          className="border border-gray-300 p-2"
        />
      </div>

      <Button 
        onClick={handleSendEmail} 
        className="bg-blue-600 mt-4 text-white" 
        size="sm"
      >
        Send Email
      </Button>
    </main>
  );
}
