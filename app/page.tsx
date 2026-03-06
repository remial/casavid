//app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import ActionButton from "@/components/ActionButton";
import ReferrerBlocker from "@/components/ReferrerBlocker";
import CasavidTypewriter from "@/components/casavid/CasavidTypewriter";
import CasavidTestimonials from "@/components/casavid/CasavidTestimonials";
import CasavidHowItWorks from "@/components/casavid/CasavidHowItWorks";
import CasavidFeatures from "@/components/casavid/CasavidFeatures";
import CasavidFaq from "@/components/casavid/CasavidFaq";
import CasavidStats from "@/components/casavid/CasavidStats";

export default async function Index() {
  const session = await getServerSession(authOptions);

  return (
    <ReferrerBlocker>
      <div className="flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-12 px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8">
            <div className="flex flex-col space-y-6 lg:w-1/2 w-full">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight font-yeseva">
                Turn <span className="text-blue-600">Photos</span> of any{" "}
                <span className="text-blue-600">Property</span> into{" "}
                <span className="text-blue-600">Walkthrough Videos</span> in{" "}
                <span className="text-blue-600">Seconds</span>
              </h1>
              
              <div className="text-xl font-semibold text-green-600 h-8">
                <CasavidTypewriter />
              </div>

              <div className="flex flex-col space-y-4">
                {!session && <ActionButton buttonText="Create Your Video" />}
                {session && (
                  <Link href="/dashboard">
                    <Button
                      className="hover:scale-105 transition duration-300 ease-in-out w-full lg:w-auto px-8 rounded-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Create Your Video
                    </Button>
                  </Link>
                )}
              </div>

              <div className="text-sm text-gray-600 space-y-1 pt-2">
                <p className="font-medium">Create professional property videos in 3 easy steps:</p>
                <p>1. Upload 1-10 photos of any property</p>
                <p>2. Choose video length and style</p>
                <p>3. Get your professional walkthrough video!</p>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <video
                  className="w-full h-auto"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src="https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/housevid.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="py-4">
          {!session && <ActionButton buttonText="Create Your Video" />}
        </div>

        {/* Testimonials */}
        <CasavidTestimonials />

        {/* CTA */}
        <div className="py-6">
          {!session && <ActionButton buttonText="Get Started Free" />}
        </div>

        {/* Stats Section */}
        <CasavidStats />

        {/* CTA */}
        <div className="py-6">
          {!session && <ActionButton buttonText="Create Your Video" />}
        </div>

        {/* How It Works */}
        <CasavidHowItWorks />

        {/* CTA */}
        <div className="py-6">
          {!session && <ActionButton buttonText="Start Creating Videos" />}
        </div>

        {/* Features */}
        <CasavidFeatures />

        {/* CTA */}
        <div className="py-6">
          {!session && <ActionButton buttonText="Create Your Video" />}
        </div>

        {/* FAQ */}
        <CasavidFaq />

        {/* Final CTA */}
        <div className="py-8">
          {!session && <ActionButton buttonText="Get Started Free" />}
        </div>
      </div>
    </ReferrerBlocker>
  );
}
