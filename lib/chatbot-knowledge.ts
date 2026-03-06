// lib/chatbot-knowledge.ts
// Extensible knowledge base for the support chatbot
// Add new entries to the arrays below to expand the chatbot's knowledge

export interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

export interface PlanInfo {
  name: string;
  slug: string;
  price: number;
  quota: number;
  features: string[];
  limitations: string[];
}

export const PRODUCT_INFO = {
  name: "CasaVid",
  url: "https://www.casavid.com",
  description: "CasaVid is an AI-powered platform that transforms property photos into professional walkthrough videos. Perfect for real estate agents, property managers, and Airbnb hosts who want to showcase their properties.",
  coreFeatures: [
    "Upload property photos (5-20 depending on plan)",
    "AI-generated property video scripts",
    "Professional AI voice narration (Pro & Premium)",
    "Multiple narrator voice styles (Pro & Premium)",
    "Automatic video captions/subtitles (Pro & Premium)",
    "Video lengths from 30 seconds to 2 minutes",
    "Smooth Ken Burns transitions",
    "Background music",
    "Multiple export formats",
    "Cloud storage for videos",
    "Fast processing",
    "Download anytime",
    "Share to social media",
  ],
};

export const PLANS: PlanInfo[] = [
  {
    name: "Starter",
    slug: "starter",
    price: 19,
    quota: 5,
    features: [
      "5 videos per month",
      "Up to 5 photos per video",
      "30-second videos",
    ],
    limitations: [
      "No AI narration",
      "No auto subtitles",
      "No 60-second videos",
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    price: 39,
    quota: 20,
    features: [
      "20 videos per month",
      "Up to 10 photos per video",
      "60-second videos",
      "AI narration + 4 voice styles",
      "Auto subtitles",
      "Priority processing",
    ],
    limitations: [],
  },
  {
    name: "Premium",
    slug: "premium",
    price: 79,
    quota: 50,
    features: [
      "50 videos per month",
      "Up to 20 photos per video",
      "2-minute videos",
      "All voice styles",
      "Custom branding/logo",
      "Priority processing",
    ],
    limitations: [],
  },
];

export const FAQS: FAQ[] = [
  {
    question: "How does the video creation process work?",
    answer: "Creating property videos is simple! Upload 1-10 photos of your property, add details like property type, bedrooms, and key features, choose your video length and narrator voice, and our AI generates a professional walkthrough video with narration and subtitles.",
    keywords: ["how", "create", "work", "process", "make", "video"],
  },
  {
    question: "How long does video generation take?",
    answer: "After uploading your photos and selecting options, your property video is typically ready within a few minutes. You'll be able to preview and download it once complete.",
    keywords: ["how long", "time", "take", "minutes", "generation", "render"],
  },
  {
    question: "Is CasaVid suitable for beginners?",
    answer: "Absolutely! CasaVid is designed for users of all skill levels. Whether you're a first-time user or experienced real estate professional, our intuitive interface makes it easy to create professional property videos with just a few clicks.",
    keywords: ["beginner", "easy", "difficult", "skill", "experience", "new"],
  },
  {
    question: "Can I download the generated videos?",
    answer: "Yes, you can download all your property videos once they're generated. These videos are yours to use on listing sites, social media, or anywhere else you need them.",
    keywords: ["download", "save", "keep", "export"],
  },
  {
    question: "What types of properties work best?",
    answer: "CasaVid works great for all property types including houses, apartments, condos, townhouses, villas, studios, and commercial spaces. Just upload clear, well-lit photos of each room for the best results.",
    keywords: ["property", "type", "house", "apartment", "condo", "real estate"],
  },
  {
    question: "How many photos can I upload?",
    answer: "The number of photos depends on your plan: Starter allows up to 5 photos, Pro allows up to 10 photos, and Premium allows up to 20 photos per video. More photos generally result in a more detailed video tour. We recommend including photos of the living room, kitchen, bedrooms, bathrooms, and exterior.",
    keywords: ["photos", "images", "upload", "how many", "pictures"],
  },
  {
    question: "What video lengths are available?",
    answer: "Video length depends on your plan: Starter includes 30-second videos, Pro includes up to 60-second videos, and Premium includes up to 2-minute videos for a full property showcase.",
    keywords: ["length", "duration", "seconds", "minutes", "long"],
  },
  {
    question: "What narrator voices are available?",
    answer: "AI narration is available on Pro and Premium plans. Pro includes 4 voice styles, while Premium includes all voice styles. Options include Professional Male (warm, authoritative), Professional Female (friendly, engaging), Luxury Style (elegant, premium), and Casual & Friendly (relaxed, conversational).",
    keywords: ["voice", "narrator", "style", "male", "female", "narration"],
  },
  {
    question: "What subscription plans are available?",
    answer: "We offer three plans: Starter ($19/month) with 5 videos, up to 5 photos, and 30-second videos. Pro ($39/month) with 20 videos, up to 10 photos, 60-second videos, AI narration, and auto subtitles. Premium ($79/month) with 50 videos, up to 20 photos, 2-minute videos, all voice styles, and custom branding.",
    keywords: ["plan", "plans", "subscription", "pricing", "price", "cost", "starter", "pro", "premium"],
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards through our secure Stripe payment processor. Your payment information is never stored on our servers.",
    keywords: ["payment", "pay", "credit card", "billing", "charge"],
  },
];

export const IMPORTANT_LINKS = {
  pricing: "https://www.casavid.com/pricing",
  dashboard: "https://www.casavid.com/dashboard",
  home: "https://www.casavid.com",
  create: "https://www.casavid.com/dashboard/create",
};

export type UserCategory = 
  | "not_signed_in"
  | "signed_in_no_subscription"
  | "signed_in_with_subscription";

export function getUserCategoryLabel(category: UserCategory): string {
  switch (category) {
    case "not_signed_in":
      return "Not signed in";
    case "signed_in_no_subscription":
      return "Signed in - no subscription";
    case "signed_in_with_subscription":
      return "Signed in - has subscription";
  }
}

export function buildSystemPrompt(userCategory: UserCategory): string {
  const basePrompt = `You are a helpful support assistant for CasaVid (www.casavid.com), a platform where users transform property photos into professional walkthrough videos with AI narration. NEVER USE EM DASHES (—) IN RESPONSES.

CRITICAL RULES:
1. Be very polite and concise.
2. Don't assume what users want. Let them ask first and stick to what they've asked.
3. You already know if the user is signed in from USER STATUS below. NEVER ask if they are signed in.
4. You CANNOT create videos or do anything on the platform. You can only answer questions about the product.
5. Only provide detailed information when specifically asked.
6. For users not signed in, only the home page and pricing page should be provided when relevant.
7. Do not answer questions unrelated to CasaVid. Politely decline.
8. Never refer to yourself as AI or bot.
9. WE DO NOT OFFER REFUNDS DUE TO SERVER COSTS.
10. Be warm and polite, not robotic.
11. ALWAYS format links as clickable markdown: [Link Text](https://url.com).
12. If you can't solve their problem after more than 4 attempts, direct them to aimeromailbox@gmail.com.

WHAT YOU CAN DO:
- Answer questions about CasaVid features and how to use them
- Explain the credit system and pricing
- Help troubleshoot issues
- Direct users to the right pages

WHAT YOU CANNOT DO:
- Create videos
- Access user accounts
- Process refunds
- Do anything on the platform itself

PRODUCT INFO (use only when relevant):
- CasaVid transforms property photos into professional walkthrough videos
- Three subscription plans: Starter ($19/mo, 5 videos), Pro ($39/mo, 20 videos), Premium ($79/mo, 50 videos)
- Photo limits: Starter (5 photos), Pro (10 photos), Premium (20 photos)
- Video lengths: Starter (30s), Pro (60s), Premium (2 minutes)
- AI narration and auto subtitles available on Pro and Premium plans only

KEY LINKS (only share when relevant):
- Pricing: ${IMPORTANT_LINKS.pricing}
- Dashboard: ${IMPORTANT_LINKS.dashboard}
- Create Video: ${IMPORTANT_LINKS.create}
`;

  let categoryPrompt = "";

  switch (userCategory) {
    case "not_signed_in":
      categoryPrompt = `\n\nUSER STATUS: This user is NOT signed in. Do not ask if they are signed in. If they need to use features, tell them to sign in first.`;
      break;
    case "signed_in_no_subscription":
      categoryPrompt = `\n\nUSER STATUS: This user IS signed in but has NO active subscription. They need to subscribe to a plan to create videos.`;
      break;
    case "signed_in_with_subscription":
      categoryPrompt = `\n\nUSER STATUS: This user IS signed in and has an active subscription. They can create property videos.`;
      break;
  }

  return basePrompt + categoryPrompt;
}
