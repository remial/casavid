import React from "react";
import ClientStoryIntro from "@/components/ClientStoryIntro";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const SampleVideosPage: React.FC = async () => {
  const session = await getServerSession(authOptions); // Fetch session on the server

  return (
    <div>
      <ClientStoryIntro session={session} /> {/* Pass session to the component */}
    </div>
  );
};

export default SampleVideosPage;
