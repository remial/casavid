# CasaVid - Real Estate Video Generator

CasaVid is a SaaS application that generates professional real estate walkthrough videos from uploaded property photos. Users upload photos, provide property details, and the system generates a narrated video with AI-powered scripts and smooth Ken Burns zoom/pan effects.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 13 (App Router) |
| Language | TypeScript |
| Auth | NextAuth.js with Firebase Adapter |
| Database | Firebase Firestore |
| Storage | Firebase Storage (photos) + Google Cloud Storage (videos) |
| Payments | Stripe (subscriptions + credits) |
| AI | OpenAI GPT-4 (scripts) + OpenAI TTS (narration) |
| Video Processing | FFmpeg on Digital Ocean Droplet |
| Styling | Tailwind CSS + shadcn/ui + Radix UI |
| Email | Resend |
| Analytics | OpenPanel, Vercel Analytics |

## Pages

### Public Pages
| Route | Purpose |
|-------|---------|
| `/` | Landing page with demo video, features, testimonials |
| `/pricing` | Subscription plans and pricing |
| `/contact` | AI chatbot for support |
| `/intro` | Product introduction |
| `/terms-conditions` | Legal terms |
| `/privacy-policy` | Privacy policy |

### Auth Pages
| Route | Purpose |
|-------|---------|
| `/auth/signin` | Sign in page |
| `/auth/signup` | Sign up page |
| `/auth/sign-in` | Alternative sign in |
| `/auth/forgot-password` | Password recovery |

### Dashboard Pages (Protected)
| Route | Purpose |
|-------|---------|
| `/dashboard` | List of user's property videos |
| `/dashboard/create` | Upload photos & configure video |
| `/dashboard/edit/[id]` | Edit property before generating |
| `/dashboard/view/[id]` | View/download completed video |

### Account Pages
| Route | Purpose |
|-------|---------|
| `/subscriptions` | Manage subscription |
| `/billing` | Billing history |
| `/success` | Post-purchase success page |

## API Routes

### Property/Video APIs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/property/create` | POST | Upload photos, create property draft in Firestore |
| `/api/property/[id]/save` | POST | Save property edits (reorder photos, captions) |
| `/api/property/[id]/generate` | POST | **Trigger video generation on DO server** |
| `/api/property/[id]/status` | GET | Poll video generation status |
| `/api/property/[id]/download` | GET | Download completed video |
| `/api/property/webhook/video-ready` | POST | Webhook from DO server when video complete |

### Payment APIs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/create-checkout` | POST | Create Stripe checkout session |
| `/api/create-topup-checkout` | POST | Create checkout for credit top-up |
| `/api/create-portal-session` | POST | Stripe customer portal |
| `/api/webhook/stripe` | POST | Stripe webhook handler |
| `/api/perform-upgrade` | POST | Handle plan upgrades |
| `/api/upgrade-preview` | GET | Preview upgrade pricing |

### User APIs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/checkCreditsAndSubscription` | GET | Check if user has credits |
| `/api/userSubscription` | GET | Get subscription details |
| `/api/check-sub` | GET | Verify subscription status |

### Email APIs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/emails/welcome` | POST | Send welcome email |
| `/api/emails/ready` | POST | Send "video ready" email |
| `/api/emails/video-failed` | POST | Notify admin of failures |
| `/api/emails/pause` | POST | Subscription paused email |
| `/api/emails/portal-notification` | POST | Billing portal notification |

### Other APIs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/contact/chat` | POST | AI chatbot (GPT-4) |
| `/api/contact/send-log` | POST | Email chat transcript |
| `/api/metacapi` | POST | Facebook Conversions API |
| `/api/snapcapi` | POST | Snapchat Conversions API |
| `/api/cron/refresh-credits` | GET | Monthly credit refresh |

## Video Generation Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. User        │     │  2. CasaVid     │     │  3. DO Server   │
│  Dashboard      │────▶│  Next.js API    │────▶│  FFmpeg API     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  4. Generate    │     │  5. Generate    │     │  6. Create      │
│  AI Script      │────▶│  TTS Audio      │────▶│  Video + FX     │
│  (GPT-4)        │     │  (OpenAI TTS)   │     │  (FFmpeg)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────┐
│  7. Upload to   │     │  8. Update      │
│  Cloud Storage  │────▶│  Firestore      │
└─────────────────┘     └─────────────────┘
```

### Detailed Flow

1. **User uploads photos** via `/dashboard/create`
   - Photos stored in Firebase Storage
   - Property document created in Firestore with status: `draft`

2. **User clicks Generate** in `/dashboard/edit/[id]`
   - Frontend calls `/api/property/[id]/generate`
   - Status updated to `processing`

3. **CasaVid API calls Digital Ocean server**
   - Endpoint: `POST /generate-casavid-video`
   - Payload: `{ propertyId, userId, webhookUrl, photos[], settings }`

4. **DO Server processes video** (DOAPIServer_v3.js)
   - Downloads photos from Firebase Storage URLs
   - Generates AI descriptions for each photo (GPT-4 Vision)
   - Creates narration script based on property details (GPT-4)
   - Generates voice narration (OpenAI TTS)
   - Creates video with zoompan effects (FFmpeg)
   - Uploads final video to Cloud Storage

5. **DO Server updates Firestore directly**
   - Sets status: `ready`
   - Sets `videoUrl` to Cloud Storage URL

6. **User sees completed video** in dashboard
   - Frontend polls `/api/property/[id]/status`
   - When ready, displays video player and download button

## Database Schema (Firestore)

```
users/
  └── {userId}/
      ├── email: string
      ├── name: string
      ├── credits: number
      ├── isSubscribed: boolean
      ├── stripeCustomerId: string
      ├── subLevel: number (1=Basic, 2=Pro, 3=Premium)
      └── properties/
          └── {propertyId}/
              ├── status: 'draft' | 'processing' | 'ready' | 'failed'
              ├── propertyType: string
              ├── bedrooms: string
              ├── bathrooms: string
              ├── highlights: string
              ├── videoLength: number (30, 60, 120)
              ├── voiceStyle: string
              ├── narratorLanguage: string (default: 'English')
              ├── photos: Array<{url, order, caption, duration}>
              ├── videoUrl?: string
              ├── thumbnailUrl?: string
              ├── createdAt: Timestamp
              └── updatedAt: Timestamp
```

## Key Components

| Component | Purpose |
|-----------|---------|
| `CreatePropertyForm` | Photo upload, video settings form |
| `PropertyEditor` | Reorder photos, add captions, trigger generate |
| `PropertyGrid` | Dashboard grid of property cards |
| `PropertyCard` | Single property card with status badge |
| `VideoViewer` | Video player with download button |
| `ChatInterface` | AI support chatbot |
| `PricingPage` | Subscription plan cards |
| `UserButton` | User dropdown menu |

## Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Digital Ocean FFmpeg Server
FFMPEG_API_URL=https://your-droplet-ip:3001
FFMPEG_API_KEY=

# Email
RESEND_API_KEY=
```

## DO Server Code

The Digital Ocean server code is backed up in the VidNarrate repository:

**Backup Location:** `VidNarrate/app/api/story/createSeries/DOAPIServer_v3.js`

This file contains all the FFmpeg video processing logic, including the `/generate-casavid-video` endpoint used by CasaVid.

## DO Server Endpoint Details

The CasaVid app only calls ONE endpoint on the Digital Ocean server:

**POST `/generate-casavid-video`**

Request:
```json
{
  "propertyId": "abc123",
  "userId": "user456",
  "webhookUrl": "https://casavid.com/api/property/webhook/video-ready",
  "photos": [
    { "url": "https://storage.../photo1.jpg", "order": 0, "caption": "" },
    { "url": "https://storage.../photo2.jpg", "order": 1, "caption": "" }
  ],
  "settings": {
    "videoLength": 60,
    "voiceStyle": "professional-male",
    "narratorLanguage": "English",
    "propertyDetails": {
      "type": "house",
      "bedrooms": "3",
      "bathrooms": "2",
      "highlights": "Pool, mountain views"
    }
  }
}
```

The DO server then:
1. Downloads all photos
2. Generates AI descriptions for each photo using GPT-4 Vision
3. Creates a narration script using GPT-4
4. Generates TTS audio using OpenAI
5. Creates video segments with zoompan effects (8x upscale for smooth motion)
6. Concatenates segments and adds audio
7. Uploads to Cloud Storage
8. Updates Firestore directly with video URL

Response (immediate):
```json
{
  "jobId": "uuid",
  "status": "queued",
  "estimatedTime": 180
}
```

The video typically takes 2-4 minutes to generate depending on photo count and video length.
