export default function CasavidStats() {
  const stats = [
    { number: "2min", label: "Average video creation time" },
    { number: "15K+", label: "Property videos created" },
    { number: "98%", label: "Agent satisfaction rate" },
  ];

  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                {stat.number}
              </p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
