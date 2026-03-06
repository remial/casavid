import { Metadata } from "next";
import ChatInterface from "@/components/ChatInterface";

export const metadata: Metadata = {
  title: "Contact Us | CasaVid Support",
  description:
    "Get help with CasaVid. Ask questions about creating property videos, subscription plans, and features.",
};

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="yeseva text-3xl font-bold text-gray-800 mb-2">
            Contact <span className="text-blue-700">Support</span>
          </h1>
          <p className="text-gray-600">
            Have questions? We're here to help 24/7.
          </p>
        </div>

        <ChatInterface />
      </div>
    </div>
  );
}
