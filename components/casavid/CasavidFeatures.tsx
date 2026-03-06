export default function CasavidFeatures() {
  const features = [
    {
      icon: "🎙️",
      title: "Professional AI Narration",
      description: "Natural-sounding voice describes each room with engaging property details you provide."
    },
    {
      icon: "📝",
      title: "Auto-Generated Subtitles",
      description: "Reach more buyers with built-in subtitles. Perfect for social media where videos autoplay muted."
    },
    {
      icon: "🎬",
      title: "Smooth Transitions",
      description: "Ken Burns effect and professional transitions make your photos come alive as a video tour."
    },
    {
      icon: "⚡",
      title: "Ready in Minutes",
      description: "No waiting days for a videographer. Upload photos now, share your video in minutes."
    },
    {
      icon: "📱",
      title: "Social Media Ready",
      description: "Export in formats optimized for YouTube, Instagram, Facebook, TikTok, and MLS listings."
    },
    {
      icon: "🏷️",
      title: "Custom Branding",
      description: "Add your logo, contact info, and agency branding to every video you create."
    }
  ];

  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-10">
          Powerful Features
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
