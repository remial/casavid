export default function CasavidTestimonials() {
  const testimonials = [
    {
      content: "Game changer! I used to spend hours coordinating videographers. Now I upload photos and get stunning videos in minutes. My listings get 3x more inquiries.",
      author: "Jennifer M.",
      role: "Real Estate Agent, Coldwell Banker",
      initials: "JM"
    },
    {
      content: "The AI narration is incredibly professional. Clients think I hired a production team. Best investment I've made for my real estate business.",
      author: "Marcus T.",
      role: "Broker, RE/MAX",
      initials: "MT"
    },
    {
      content: "Perfect for Airbnb hosts! I created videos for all 12 of my properties in one afternoon. The subtitles make them accessible to international guests.",
      author: "Sarah K.",
      role: "Airbnb Superhost",
      initials: "SK"
    }
  ];

  return (
    <section id="testimonials" className="w-full py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="yeseva text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-2">
          Loved by Real Estate Professionals
        </h2>
        <p className="text-center text-gray-600 mb-10">
          See what agents are saying about <span className="font-semibold text-blue-600">CasaVid</span>
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-yellow-400 text-lg mb-3">★★★★★</div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
