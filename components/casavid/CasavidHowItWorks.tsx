export default function CasavidHowItWorks() {
  const steps = [
    {
      icon: "1️⃣",
      title: "Upload Your Photos",
      description: "Upload 1-10 high-quality photos of the property — living room, bedrooms, kitchen, bathrooms, exterior"
    },
    {
      icon: "2️⃣",
      title: "Choose Your Settings",
      description: "Select video length (30s to 2min), narrator voice style, and add property details for the script"
    },
    {
      icon: "3️⃣",
      title: "Get Your Video",
      description: "Our AI creates a professional walkthrough video with smooth transitions, narration, and subtitles"
    }
  ];

  return (
    <section id="how-it-works" className="w-full py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-10">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
