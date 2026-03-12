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

export interface SupportUserContext {
  category: UserCategory;
  name?: string | null;
  email?: string | null;
  planName?: string | null;
  credits?: number | null;
  signInMethod?: string | null;
}

export const PRODUCT_INFO = {
  name: "CasaVid",
  url: "https://www.casavid.com",
  description:
    "CasaVid is an AI-powered platform that turns property photos into narrated walkthrough videos for real estate marketing.",
  coreFeatures: [
    "Upload 1-10 property photos when creating a video",
    "Choose property type, bedrooms, bathrooms, and key highlights",
    "Choose video length: 30 seconds, 60 seconds, or 2 minutes",
    "Choose from 4 narration voices: Professional Male, Professional Female, Luxury, and Casual",
    "AI-generated property narration based on listing details and photo order",
    "Reorder photos before generating the video",
    "Add optional captions for each photo",
    "Adjust per-photo duration from 2 to 15 seconds",
    "Smooth Ken Burns transitions",
    "Video generation usually completes in 2-5 minutes",
    "View completed videos in the dashboard",
    "Download completed videos from the dashboard",
    "Manage subscription and billing through Stripe",
  ],
};

export const PLANS: PlanInfo[] = [
  {
    name: "Starter",
    slug: "starter",
    price: 19,
    quota: 5,
    features: [
      "5 video credits per month",
      "Access to the CasaVid dashboard",
      "Create narrated property videos",
    ],
    limitations: [],
  },
  {
    name: "Pro",
    slug: "pro",
    price: 39,
    quota: 20,
    features: [
      "20 video credits per month",
      "Access to the CasaVid dashboard",
      "Create narrated property videos",
    ],
    limitations: [],
  },
  {
    name: "Premium",
    slug: "premium",
    price: 79,
    quota: 50,
    features: [
      "50 video credits per month",
      "Access to the CasaVid dashboard",
      "Create narrated property videos",
    ],
    limitations: [],
  },
];

export const FAQS: FAQ[] = [
  {
    question: "How does the video creation process work?",
    answer:
      "Create a property video in 3 steps: upload 1-10 photos, enter property details like type, bedrooms, bathrooms, and highlights, then choose a video length and narration voice. After that, you can reorder photos, add optional captions, and generate the final walkthrough video.",
    keywords: ["how", "create", "work", "process", "make", "video"],
  },
  {
    question: "How long does video generation take?",
    answer:
      "Most property videos are ready in about 2-5 minutes after generation starts. You can leave the page and return to the dashboard later, and ready videos can be viewed or downloaded there.",
    keywords: ["how long", "time", "take", "minutes", "generation", "render"],
  },
  {
    question: "Is CasaVid suitable for beginners?",
    answer:
      "Yes. CasaVid is designed to be simple for first-time users and fast for experienced agents. The flow is guided, and you only need photos plus a few property details to create a video.",
    keywords: ["beginner", "easy", "difficult", "skill", "experience", "new"],
  },
  {
    question: "Can I download the generated videos?",
    answer:
      "Yes. When a video is ready, you can open it from the dashboard and download it directly.",
    keywords: ["download", "save", "keep", "export"],
  },
  {
    question: "What types of properties work best?",
    answer:
      "CasaVid supports many property types including houses, apartments, flats, townhouses, villas, bungalows, duplexes, penthouses, studios, lofts, cottages, cabins, land, and commercial spaces. Clear, well-lit photos usually produce the best results.",
    keywords: ["property", "type", "house", "apartment", "condo", "real estate"],
  },
  {
    question: "How many photos can I upload?",
    answer:
      "The current create flow supports 1-10 photos per property video. For best results, include the living room, kitchen, bedrooms, bathrooms, exterior, and any standout features.",
    keywords: ["photos", "images", "upload", "how many", "pictures"],
  },
  {
    question: "What video lengths are available?",
    answer:
      "The dashboard currently offers 3 video lengths: 30 seconds, 60 seconds, and 2 minutes.",
    keywords: ["length", "duration", "seconds", "minutes", "long"],
  },
  {
    question: "What narrator voices are available?",
    answer:
      "The current create flow offers 4 narration voices: Professional Male, Professional Female, Luxury Style, and Casual & Friendly.",
    keywords: ["voice", "narrator", "style", "male", "female", "narration"],
  },
  {
    question: "What subscription plans are available?",
    answer:
      "CasaVid currently offers 3 monthly plans: Starter for $19/month with 5 video credits, Pro for $39/month with 20 video credits, and Premium for $79/month with 50 video credits.",
    keywords: ["plan", "plans", "subscription", "pricing", "price", "cost", "starter", "pro", "premium"],
  },
  {
    question: "What property details can I add before generating?",
    answer:
      "Before generating, you can set the property type, number of bedrooms, number of bathrooms, and optional key highlights. You can also reorder photos, add optional captions, and adjust how long each photo appears on screen.",
    keywords: ["details", "bedrooms", "bathrooms", "highlights", "captions", "reorder"],
  },
  {
    question: "How do credits work?",
    answer:
      "CasaVid uses credits for video creation. The current plans include 5, 20, or 50 credits per month depending on your subscription. The editor shows that generating a video uses 1 credit, and if generation fails the interface tells users the credit is refunded.",
    keywords: ["credits", "credit", "usage", "quota", "limit"],
  },
  {
    question: "How do I manage or cancel my subscription?",
    answer:
      "Contact aimeromailbox@gmail.com to cancel your subscription.",
    keywords: ["cancel", "billing", "portal", "manage", "subscription", "unsubscribe"],
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept major credit cards through Stripe. Payment details are handled by Stripe rather than stored directly on CasaVid servers.",
    keywords: ["payment", "pay", "credit card", "billing", "charge"],
  },
];

export const IMPORTANT_LINKS = {
  pricing: "https://www.casavid.com/pricing",
  dashboard: "https://www.casavid.com/dashboard",
  home: "https://www.casavid.com",
  create: "https://www.casavid.com/dashboard/create",
  signin: "https://www.casavid.com/auth/signin",
  subscriptions: "https://www.casavid.com/subscriptions",
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

function buildUserContextBlock(userContext: SupportUserContext): string {
  const lines = [`USER STATUS: ${getUserCategoryLabel(userContext.category)}.`];

  if (userContext.name) {
    lines.push(`Known customer name: ${userContext.name}`);
  }

  if (userContext.email) {
    lines.push(`Known customer email: ${userContext.email}`);
  }

  if (userContext.planName) {
    lines.push(`Known plan: ${userContext.planName}`);
  }

  if (typeof userContext.credits === "number") {
    lines.push(`Known remaining credits: ${userContext.credits}`);
  }

  if (userContext.signInMethod) {
    lines.push(`Known sign-in method: ${userContext.signInMethod}`);
  }

  return lines.join("\n");
}

export function buildSystemPrompt(userContextOrCategory: SupportUserContext | UserCategory): string {
  const userContext: SupportUserContext =
    typeof userContextOrCategory === "string"
      ? { category: userContextOrCategory }
      : userContextOrCategory;

  const basePrompt = `You are a helpful support assistant for CasaVid (www.casavid.com), a platform where users turn property photos into narrated walkthrough videos. NEVER USE EM DASHES (—) IN RESPONSES.

CRITICAL RULES:
1. Be very polite and concise.
2. Don't assume what users want. Let them ask first and stick to what they've asked.
3. You already know the user's status from USER STATUS below. NEVER ask if they are signed in.
4. You CANNOT create videos or do anything on the platform. You can only answer questions about the product.
5. Only provide detailed information when specifically asked.
6. For users not signed in, please ask them to sign in to be able to see the pricing details.
7. Do not answer questions unrelated to CasaVid. Politely decline.
8. Never refer to yourself as AI or bot.
9. WE DO NOT OFFER REFUNDS DUE TO SERVER COSTS.
9. If a user wants to cancel their subscription, ask for the reason and for feedback on the video they've generated. Ask them what they would like to see or improve. You need to understand and suggest improvements first. If they insist on cancelling, give them the link to the Manage Subscription page. ${IMPORTANT_LINKS.subscriptions}
10. Be warm and polite, not robotic.
11. ALWAYS format links as clickable markdown: [Link Text](https://url.com).
12. If you can't solve their problem after more than 4 attempts, direct them to aimeromailbox@gmail.com.
13. Use any KNOWN CUSTOMER DETAILS below when relevant, but do not expose unnecessary private details.
14. Do not invent features that are not listed here.


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
- CasaVid turns property photos into narrated walkthrough videos
- Current create flow supports 1-10 uploaded photos
- Users can set property type, bedrooms, bathrooms, and key highlights
- Users can choose 30-second, 60-second, or 2-minute videos
- Users can choose 4 voice styles: Professional Male, Professional Female, Luxury Style, Casual & Friendly
- Users can reorder photos, add optional captions, and adjust per-photo durations
- Videos usually take 2-5 minutes to generate
- Completed videos can be viewed and downloaded from the dashboard
- Current monthly plans are Starter ($19, 5 credits), Pro ($39, 20 credits), Premium ($79, 50 credits)
- The current dashboard does NOT clearly show support for auto subtitles, custom branding, social posting, or more than 10 uploaded photos in the create flow

KEY LINKS (only share when relevant):
- Pricing: ${IMPORTANT_LINKS.pricing}
- Dashboard: ${IMPORTANT_LINKS.dashboard}
- Create Video: ${IMPORTANT_LINKS.create}

`;

  let categoryPrompt = "";

  switch (userContext.category) {
    case "not_signed_in":
      categoryPrompt = `\n\nThis user is not signed in. If they need to create or manage videos or want information about pricing, tell them to sign in first.`;
      break;
    case "signed_in_no_subscription":
      categoryPrompt = `\n\nThis user is signed in but does not currently have an active subscription. They need a plan with credits to create videos. Please ask them to subscribe to a plan by visiting the pricing page`;
      break;
    case "signed_in_with_subscription":
      categoryPrompt = `\n\nThis user is signed in and has an active subscription. If credits are available, they can create property videos.`;
      break;
  }

  return `${basePrompt}${categoryPrompt}\n\n${buildUserContextBlock(userContext)}`;
}
