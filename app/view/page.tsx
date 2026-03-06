import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import CasavidTestimonials from "@/components/casavid/CasavidTestimonials";
import CasavidTypewriter from "@/components/casavid/CasavidTypewriter";
import ActionButton from "@/components/ActionButton";
import CasavidHowItWorks from "@/components/casavid/CasavidHowItWorks";
import CasavidFaq from "@/components/casavid/CasavidFaq";
import ReferrerBlocker from "@/components/ReferrerBlocker";
import CasavidFeatures from "@/components/casavid/CasavidFeatures";

export default async function ViewPage() {
  const session = await getServerSession(authOptions);

  return (
    <ReferrerBlocker>
      <div className="flex flex-col items-center pt-6">
        <div className="flex flex-col lg:flex-row items-center gap-4 px-8 py-2 max-w-6xl w-full">
          <div className="flex flex-col space-y-4 lg:w-1/2 w-full">
            <h1 className="yeseva text-4xl text-gray-800 font-bold">
              Turn <span className="text-green-600">Property Photos</span> into{" "}
              <span className="text-green-600">Walkthrough Videos</span> in Seconds
            </h1>
            <div className="text-xl font-bold text-green-600 mb-4">
              <CasavidTypewriter />
            </div>
            <div className="flex flex-col space-y-8">
              {!session && <ActionButton buttonText="Create Your Video" />}
              {session && (
                <Link href="/dashboard">
                  <Button className="hover:scale-105 transition duration-300 ease-in-out w-full lg:w-auto px-8 rounded-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white">
                    Create Your Video
                  </Button>
                </Link>
              )}
              <div className="text-sm text-gray-800 italic">
                <p>Create professional property videos in 3 easy steps:</p>
                <p>1. Upload 1-10 photos of any property</p>
                <p>2. Choose video length and style</p>
                <p>3. Get your video with AI narration &amp; subtitles!</p>
              </div>
            </div>
          </div>
          <div className="ml-5 lg:w-1/2 w-full mt-2 lg:mt-0 items-center rounded">
            <video
              className="w-full h-auto rounded-xl shadow-2xl"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source
                src="https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/housevid.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <CasavidTestimonials />
        <div className="py-2">
          {!session && <ActionButton buttonText="Create Your Video" />}
        </div>

        <CasavidFeatures />
        <CasavidHowItWorks />

        <div className="pt-6">
          {!session && <ActionButton buttonText="Create Your Video" />}
        </div>

        <CasavidFaq />
        <div className="mt-4">
          {!session && <ActionButton buttonText="Create Your Video" />}
        </div>
      </div>
    </ReferrerBlocker>
  );
}
