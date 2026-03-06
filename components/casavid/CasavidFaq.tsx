'use client';

import { useState } from 'react';

const faqs = [
  {
    question: "How many photos should I upload?",
    answer: "We recommend 5-10 photos for the best results. Include the main living areas, bedrooms, kitchen, bathrooms, and any standout features. More photos allow for longer, more detailed videos."
  },
  {
    question: "What does the AI narrator say?",
    answer: "The AI generates a professional script based on the property details you provide (square footage, bedrooms, special features). It describes each room naturally, highlighting selling points in a warm, engaging tone."
  },
  {
    question: "Can I edit the narration script?",
    answer: "Yes! You can provide your own script or edit the AI-generated one before the video is created. Pro and Business plans include unlimited script revisions."
  },
  {
    question: "What video formats are supported?",
    answer: "We export in MP4 format with options for landscape (16:9 for YouTube/websites), square (1:1 for Instagram), and portrait (9:16 for TikTok/Reels). All exports include embedded subtitles."
  },
  {
    question: "How long does it take to create a video?",
    answer: "Most videos are ready in 2-5 minutes depending on length and complexity. Business plan users get priority processing for even faster turnaround."
  }
];

export default function CasavidFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-10">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                <span className="text-2xl text-gray-400">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
