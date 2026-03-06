import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { TestimonialsShorts } from "@/components/TestimonialsShorts";
import TypewriterTitle from "@/components/TypewriterTitle";
import ActionButton from "@/components/ActionButton";
import HowItWorks from "@/components/HowItWorks";
import FaqShorts from "@/components/FaqShorts";
import ReferrerBlocker from "@/components/ReferrerBlocker";
import FeatureSection from "@/components/FeatureSection";


export default async function Index() {
  const session = await getServerSession(authOptions);

  return (
    <ReferrerBlocker>
      <div className="flex flex-col items-center pt-6">
        <div className="flex flex-col lg:flex-row items-center gap-4 px-8 py-2 max-w-6xl w-full">
          <div className="flex flex-col space-y-4 lg:w-1/2 w-full">
            <h1 className="yeseva text-4xl text-gray-800 font-bold">
              Generate <span className="text-blue-700"> Video Content ✨ </span> on various Topics with <span className="text-blue-700">A.I. 🚀</span>
            </h1>
            <div className="text-xl font-bold text-blue-700 mb-4">
              <TypewriterTitle />
            </div>
            <div className="flex flex-col space-y-8">
              {!session && <ActionButton buttonText="Sign Up - For Free" />}
              {session && (
                <Link href="/dashboard">
                  <Button
                    className="hover:scale-110 transition duration-300 ease-in-out w-full lg:w-1/2 rounded-full text-xl"
                    style={{ backgroundColor: 'blue', color: 'white' }}
                  >
                    Generate
                  </Button>
                </Link>
              )}
              <div className="text-sm text-gray-800 italic">
                <p>Start with quick easy steps!</p>
                <p>1. Choose Topic, Voice and Background Music </p>
                <p>2. Verify the generated script</p>
                <p>3. Download Video or Automatically post to Social Media ✨</p>
              </div>
            </div>
          </div>
          <div className="ml-5 lg:w-1/2 w-full mt-2 lg:mt-0 items-center rounded">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/q2OQUSIQ5ls"
              title="Vidnarrate Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        </div>

        <TestimonialsShorts />
        <div className="py-2">
          {!session && <ActionButton buttonText="Sign Up - For Free" />}
        </div>

        <FeatureSection
          badge="Topic Flexibility"
          title="Create Videos on"
          subtitle="Any Topic in Many Languages ✨"
          description="Create videos on any topic you want in many languages. You can choose from a wide range of topics and genres to create your own unique video content."
          features={[
            "Choose from our long list of topics or specify your own",
            "Select from our long list of languages",
            "Choose from various Art Styles",
            "Post directly to Social Media",
          ]}
          videos={[ 
            { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Cars.mp4", title: "Cars" },             
            { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/Travel%20Tips.mp4", title: "Travel Content" },
            { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/Faceless%20Video%20Beauty%206.mp4", title: "Beauty Tips" },
            { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Space.mp4", title: "Space" },
            { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Apple.mp4", title: "Apple" },
          ]}
          accentColor="blue"
          isLoggedIn={!!session}
        />
        <HowItWorks />
      
        <div className="pt-6">
          {!session && <ActionButton buttonText="Sign Up - For Free" />}
        </div>
        
        <div className="w-full bg-gradient-to-b from-white to-blue-50 py-8">
          <div className="text-center mb-8 px-4">
            <h2 className="yeseva text-3xl lg:text-4xl font-bold text-gray-800">
              Powerful Features for <span className="text-blue-700">Content Creators</span>
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Everything you need to create engaging videos that grow your audience
            </p>
          </div>

          <div className="pt-4 px-4">
            {!session && <ActionButton buttonText="Sign Up - For Free" />}
          </div>
          <FeatureSection
            badge="Real Time Content"
            title="Create Videos on"
            subtitle="Current Breaking News 📰"
            description="Is there a Breaking News on your favourite Sports Team, Celebrity, Politician or any other topic? Create a video on it."
            features={[
              "Create videos on current breaking news on any topic",
              "Specify the news topic and generate the video",
            ]}
            videos={[
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Arsenal.mp4", title: "Arsenal" },
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Curry.mp4", title: "Curry" },
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Bitcoin.mp4", title: "Bitcoin" },
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Brady.mp4", title: "Brady" },
            ]}
            reverse={true}
            accentColor="green"
            isLoggedIn={!!session}
          />
          <div className="pt-4 px-4">
            {!session && <ActionButton buttonText="Sign Up - For Free" />}
          </div>
          <FeatureSection
            badge="Premium Quality"
            title="Cinema Mode"
            subtitle="& Animated Videos 🎬"
            description="Create stunning cinematic videos with quality visuals. Add motion to your images for that extra wow factor that stops the scroll."
            features={[
              "Cinematic-quality AI image generation",
              "Animate static images into moving videos",
              "Perfect for storytelling and dramatic content",
              "Regenerate any section",
            ]}
            videos={[
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Moses.mp4", title: "Moses" },
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Extended.mp4", title: "Extended Demo" },
            ]}
            accentColor="blue"
            isLoggedIn={!!session}
          />
          <div className="pt-4 px-4">
            {!session && <ActionButton buttonText="Sign Up - For Free" />}
          </div>
          <FeatureSection
            badge="Go Long"
            title="Create Long Videos"
            subtitle="and specify exact Length and script 🚀"
            description="Ready to create longer content? Generate extended videos with multiple scenes, perfect for YouTube, educational content, or in-depth storytelling that keeps your audience watching."
            features={[
              "Create videos longer than typical shorts",
              "Multiple generated scenes per video",
              "Full control over each segment",
              "Perfect for tutorials and storytelling",
            ]}
            videos={[
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Solar%20Star.mp4", title: "Space" },
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Astro.mp4", title: "Astronaut" },
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/Extended.mp4", title: "Extended Demo" },
              { url: "https://vidnarrate.sfo3.cdn.digitaloceanspaces.com/SAMPLES/AI%20script%20helper.mp4", title: "AI Script Helper" },
            ]}
            reverse={true}
            accentColor="orange"
            isLoggedIn={!!session}
          />
        </div>

        <div className="py-4">
          {!session && <ActionButton buttonText="Start Creating Videos" />}
        </div>

        <FaqShorts />
        <div className="mt-4">
          {!session && <ActionButton buttonText="Sign Up - For Free" />}
        </div>
      </div>
    </ReferrerBlocker>
  );
}
