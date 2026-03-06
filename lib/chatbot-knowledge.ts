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
  description: "CasaVid is an AI-powered platform that transforms property photos into professional walkthrough videos with AI narration and subtitles. Perfect for real estate agents, property managers, and Airbnb hosts who want to showcase their properties.",
  coreFeatures: [
    "Upload 1-10 property photos",
    "AI-generated property video scripts",
    "Professional AI voice narration",
    "Multiple narrator voice styles",
    "Automatic video captions/subtitles",
    "Multiple video length options (30s, 60s, 2min)",
    "Property type customization",
    "Key features highlighting",
  ],
};

export const PLANS: PlanInfo[] = [
  {
    name: "Pay Per Video",
    slug: "credits",
    price: 5,
    quota: 1,
    features: [
      "1 credit = 1 property video",
      "Professional AI narration",
      "Auto-generated subtitles",
      "Download in HD",
      "Multiple video lengths",
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
    question: "How many photos should I upload?",
    answer: "You can upload between 1 and 10 photos per property video. More photos generally result in a more detailed video tour. We recommend including photos of the living room, kitchen, bedrooms, bathrooms, and exterior.",
    keywords: ["photos", "images", "upload", "how many", "pictures"],
  },
  {
    question: "What video lengths are available?",
    answer: "CasaVid offers three video length options: 30 seconds for a quick overview, 60 seconds for a standard tour, and 2 minutes for a full property showcase.",
    keywords: ["length", "duration", "seconds", "minutes", "long"],
  },
  {
    question: "What narrator voices are available?",
    answer: "We offer multiple narrator voice styles: Professional Male (warm, authoritative), Professional Female (friendly, engaging), Luxury Style (elegant, premium), and Casual & Friendly (relaxed, conversational).",
    keywords: ["voice", "narrator", "style", "male", "female", "narration"],
  },
  {
    question: "How do credits work?",
    answer: "Each property video costs 1 credit. You can purchase credits from the pricing page. Credits don't expire and can be used anytime.",
    keywords: ["credit", "credits", "cost", "pay", "price"],
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
  | "signed_in_no_credits"
  | "signed_in_with_credits";

export function getUserCategoryLabel(category: UserCategory): string {
  switch (category) {
    case "not_signed_in":
      return "Not signed in";
    case "signed_in_no_credits":
      return "Signed in - no credits";
    case "signed_in_with_credits":
      return "Signed in - has credits";
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
- Upload 1-10 photos, add property details, choose video length and narrator voice
- Video lengths: 30 seconds, 60 seconds, or 2 minutes
- 1 credit = 1 property video
- Videos include AI narration and auto-generated subtitles

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
    case "signed_in_no_credits":
      categoryPrompt = `\n\nUSER STATUS: This user IS signed in but has NO credits. They need to purchase credits to create videos.`;
      break;
    case "signed_in_with_credits":
      categoryPrompt = `\n\nUSER STATUS: This user IS signed in and has credits. They can create property videos.`;
      break;
  }

  return basePrompt + categoryPrompt;
}
