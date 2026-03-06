# CasaVid Video Generation Backend Plan

## Overview

CasaVid generates real estate walkthrough videos from user-uploaded photos. The video generation pipeline involves:
1. **Photo storage** (Firebase Storage - already implemented)
2. **AI description generation** (OpenAI Vision API)
3. **Voice synthesis** (OpenAI TTS)
4. **Video generation** (FFmpeg on DigitalOcean server)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CASAVID FRONTEND                            │
│  (Next.js on Vercel)                                                │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                               │
│                                                                     │
│  /api/property/create          - Upload photos to Firebase Storage  │
│  /api/property/[id]/generate   - Trigger video generation           │
│  /api/property/webhook/video-ready - Receive completed video URL    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              DIGITALOCEAN FFmpeg SERVER                             │
│              64.23.164.108 (1 vCPU, 4GB RAM, 50GB Disk)                  │
│                                                                     │
│  POST /generate-casavid-video                                       │
│    - Receives: photo URLs, property details, settings               │
│    - Calls OpenAI Vision for descriptions                           │
│    - Calls OpenAI TTS for narration                                 │
│    - FFmpeg: zoompan + audio overlay                                │
│    - Uploads to Firebase Storage                                    │
│    - Sends webhook callback                                         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FIREBASE STORAGE                                 │
│  /properties/{userId}/{timestamp}_{index}_{filename} - Source photos│
│  /videos/casavid/{uuid}.mp4 - Generated videos                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Current State

### Photo Storage (Already Implemented)
Photos are uploaded via `/api/property/create` and stored in Firebase Storage:
- Path: `properties/{userId}/{timestamp}_{index}_{filename}`
- Made public immediately for FFmpeg server access
- Stored as array in Firestore: `{ url, order, caption, duration }`

### Existing DO Server
Server at `64.23.164.108` runs PM2 processes:
- `ffmpeg-api` - Main video processing (port 3000)
- `stitch-api` - Video stitching
- `scheduler` - Job scheduling
- `scenarios-api` - Extended scenarios
- `puppeteer-api` - Browser automation

The server has a **priority queue system** with LIVE/SCHEDULED priorities and max 2 concurrent FFmpeg jobs.

---

## New Endpoint: `/generate-casavid-video`

### Request Payload

```typescript
interface CasavidVideoRequest {
  propertyId: string;
  userId: string;
  webhookUrl: string;
  photos: Array<{
    url: string;      // Firebase Storage public URL
    order: number;    // Display order (0-indexed)
    caption?: string; // User-provided caption (optional)
  }>;
  settings: {
    videoLength: 30 | 60 | 120;  // seconds
    voiceStyle: 'professional-male' | 'professional-female' | 'luxury' | 'casual';
    propertyDetails: {
      type: string;       // house, apartment, etc.
      bedrooms: string;
      bathrooms: string;
      highlights?: string; // User-provided highlights
    };
  };
}
```

### Response

```typescript
interface CasavidVideoResponse {
  jobId: string;
  status: 'queued' | 'processing';
  estimatedTime: number; // seconds
}
```

---

## Video Generation Pipeline

### Step 1: Download Photos
```javascript
async function downloadPhotos(photos, jobDir) {
  const localPaths = [];
  for (const photo of photos) {
    const response = await fetch(photo.url);
    const buffer = await response.buffer();
    const localPath = path.join(jobDir, `photo_${photo.order}.jpg`);
    fs.writeFileSync(localPath, buffer);
    localPaths.push({ ...photo, localPath });
  }
  return localPaths;
}
```

### Step 2: Generate Descriptions with OpenAI Vision

For each photo, call OpenAI GPT-4o Vision API:

```javascript
async function generateDescriptions(photos, propertyDetails) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const descriptions = [];
  
  for (const photo of photos) {
    const base64Image = fs.readFileSync(photo.localPath).toString('base64');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a real estate video narrator. Describe this room/space in 1-2 engaging sentences suitable for a property walkthrough video. Property details: ${propertyDetails.type}, ${propertyDetails.bedrooms} bedrooms, ${propertyDetails.bathrooms} bathrooms. ${propertyDetails.highlights || ''}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'low' // Use 'low' for cost efficiency
              }
            }
          ]
        }
      ],
      max_tokens: 100
    });
    
    descriptions.push({
      photoIndex: photo.order,
      text: response.choices[0].message.content
    });
  }
  
  return descriptions;
}
```

### Step 3: Generate Full Script

Combine descriptions into a cohesive narration:

```javascript
async function generateScript(descriptions, propertyDetails, videoLength) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Target word count based on video length (~150 words/minute)
  const targetWords = Math.floor((videoLength / 60) * 140);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are writing narration for a real estate video tour. Create a smooth, engaging script that flows naturally between scenes. Target approximately ${targetWords} words for a ${videoLength}-second video.`
      },
      {
        role: 'user',
        content: `Property: ${propertyDetails.type}, ${propertyDetails.bedrooms} bed, ${propertyDetails.bathrooms} bath.
        
Scene descriptions (in order):
${descriptions.map((d, i) => `Scene ${i + 1}: ${d.text}`).join('\n')}

Write a cohesive narration script that smoothly transitions between scenes. Include an engaging opening and closing. Do not include scene markers in the output.`
      }
    ],
    max_tokens: 500
  });
  
  return response.choices[0].message.content;
}
```

### Step 4: Generate Voice with OpenAI TTS

```javascript
async function generateVoice(script, voiceStyle, jobDir) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Map CasaVid voice styles to OpenAI voices
  const voiceMap = {
    'professional-male': 'onyx',
    'professional-female': 'nova',
    'luxury': 'shimmer',
    'casual': 'echo'
  };
  
  const voice = voiceMap[voiceStyle] || 'nova';
  
  const mp3Response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice,
    input: script,
    speed: 1.0
  });
  
  const audioPath = path.join(jobDir, 'narration.mp3');
  const buffer = Buffer.from(await mp3Response.arrayBuffer());
  fs.writeFileSync(audioPath, buffer);
  
  return audioPath;
}
```

### Step 5: FFmpeg Video Generation

**Key considerations for variable photo sizes:**
- Use `scale` with `force_original_aspect_ratio=decrease` to fit without stretching
- Use `pad` to add black bars (letterbox/pillarbox) for consistent canvas
- Apply `zoompan` for Ken Burns effect (zoom + pan)

```javascript
async function generateVideo(photos, audioPath, jobDir, aspectRatio = 'portrait') {
  const audioDuration = await getAudioDuration(audioPath);
  const photoCount = photos.length;
  const durationPerPhoto = audioDuration / photoCount;
  
  // Output resolution
  const resolution = aspectRatio === 'landscape'
    ? { width: 1920, height: 1080 }
    : { width: 1080, height: 1920 };
  
  // Intermediate resolution for faster zoompan processing
  const intermediateRes = aspectRatio === 'landscape'
    ? { width: 960, height: 540 }
    : { width: 540, height: 960 };
  
  const outputPath = path.join(jobDir, 'output.mp4');
  const segmentPaths = [];
  
  // Process each photo as a segment
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const segmentPath = path.join(jobDir, `segment_${i}.mp4`);
    const frameCount = Math.round(durationPerPhoto * 25);
    const halfFrames = Math.floor(frameCount / 2);
    const panDirection = i % 2 === 0 ? '+1' : '-1';
    
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(photo.localPath)
        .inputOptions(['-loop', '1'])
        .complexFilter([
          // Step 1: Scale to fit intermediate resolution (no stretching)
          `[0:v]scale=${intermediateRes.width}:${intermediateRes.height}:force_original_aspect_ratio=decrease,` +
          // Step 2: Pad to exact size with black bars
          `pad=${intermediateRes.width}:${intermediateRes.height}:(ow-iw)/2:(oh-ih)/2:color=black,` +
          // Step 3: Apply zoompan (Ken Burns effect)
          `zoompan=z='if(lte(on,${halfFrames}),zoom+0.002,zoom-0.002)':` +
          `x='iw/2-(iw/zoom/2)${panDirection}*on*0.1':` +
          `y='ih/2-(ih/zoom/2)':` +
          `d=${frameCount}:s=${intermediateRes.width}x${intermediateRes.height}:fps=25,` +
          // Step 4: Scale to final resolution
          `scale=${resolution.width}:${resolution.height},` +
          `setsar=1,format=yuv420p[v]`
        ])
        .outputOptions([
          '-map', '[v]',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-t', String(durationPerPhoto),
          '-an' // No audio for segments
        ])
        .output(segmentPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    
    segmentPaths.push(segmentPath);
  }
  
  // Concatenate segments
  const concatListPath = path.join(jobDir, 'concat.txt');
  fs.writeFileSync(concatListPath, segmentPaths.map(p => `file '${p}'`).join('\n'));
  
  const concatenatedPath = path.join(jobDir, 'concatenated.mp4');
  
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions(['-c:v', 'copy'])
      .output(concatenatedPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
  
  // Add audio
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatenatedPath)
      .input(audioPath)
      .outputOptions([
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-shortest',
        '-movflags', '+faststart'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
  
  return outputPath;
}
```

### Step 6: Upload to Firebase & Webhook

```javascript
async function uploadAndNotify(videoPath, webhookUrl, propertyId, userId) {
  // Upload to Firebase Storage
  const bucket = firebase.storage().bucket();
  const fileName = `videos/casavid/${uuidv4()}.mp4`;
  
  await bucket.upload(videoPath, {
    destination: fileName,
    public: true,
  });
  
  const videoUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
  // Send webhook callback
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      propertyId,
      userId,
      status: 'ready',
      videoUrl,
    }),
  });
  
  return videoUrl;
}
```

---

## Full Endpoint Implementation

```javascript
app.post('/generate-casavid-video', async (req, res) => {
  const priority = getPriority(req);
  const jobId = uuidv4();
  const jobDir = path.join(os.tmpdir(), `casavid_${jobId}`);
  
  try {
    const { release, tracker } = await waitForSlot(priority, '/generate-casavid-video');
    
    // Don't wait for completion - return immediately
    res.status(200).json({ 
      jobId, 
      status: 'processing',
      estimatedTime: req.body.settings.videoLength * 2 // Rough estimate
    });
    
    // Process asynchronously
    (async () => {
      try {
        ensureDirectoryExists(jobDir);
        
        const { photos, settings, webhookUrl, propertyId, userId } = req.body;
        
        tracker.step('Downloading photos');
        const localPhotos = await downloadPhotos(photos, jobDir);
        
        tracker.step('Generating AI descriptions');
        const descriptions = await generateDescriptions(localPhotos, settings.propertyDetails);
        
        tracker.step('Creating narration script');
        const script = await generateScript(descriptions, settings.propertyDetails, settings.videoLength);
        
        tracker.step('Generating voice');
        const audioPath = await generateVoice(script, settings.voiceStyle, jobDir);
        
        tracker.step('Creating video');
        const videoPath = await generateVideo(localPhotos, audioPath, jobDir);
        
        tracker.step('Uploading to Firebase');
        await uploadAndNotify(videoPath, webhookUrl, propertyId, userId);
        
        tracker.step('Cleanup');
        fs.rmSync(jobDir, { recursive: true, force: true });
        
        release();
        
      } catch (error) {
        console.error('CasaVid generation error:', error);
        
        // Notify failure via webhook
        try {
          await fetch(req.body.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propertyId: req.body.propertyId,
              userId: req.body.userId,
              status: 'failed',
              error: error.message,
            }),
          });
        } catch (e) {}
        
        release();
      }
    })();
    
  } catch (error) {
    console.error('CasaVid endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## Environment Variables Required

### On DigitalOcean Server
No new environment variables needed - uses existing config:
```bash
OPENAI_API_KEY=sk-xxx  # Already exists for VidNarrate Whisper
# Firebase Admin SDK already configured at /root/firebase/firebase-admin-sdk.json
# Firebase Storage bucket already configured (vidnarrate.appspot.com)
```

### On Vercel (CasaVid App)
Add this to your Vercel project environment variables:
```bash
FFMPEG_API_URL=http://64.23.164.108:3000
```

### Implementation Status (March 2026)
- [x] `/generate-casavid-video` endpoint added to DOAPIServer_v3.js
- [x] `/api/property/[id]/generate` API route updated in CasaVid
- [x] `/api/property/webhook/video-ready` webhook handler exists
- [x] 30-minute timeout configured for CasaVid jobs
- [x] LIVE priority for queue integration

---

## Cost Estimates Per Video

| Component | 30s Video | 60s Video | 120s Video |
|-----------|-----------|-----------|------------|
| OpenAI Vision (10 photos, low detail) | $0.02 | $0.02 | $0.02 |
| OpenAI GPT-4o (script generation) | $0.01 | $0.01 | $0.01 |
| OpenAI TTS | $0.007 | $0.014 | $0.027 |
| Server compute | $0.01 | $0.01 | $0.02 |
| **Total** | **~$0.05** | **~$0.05** | **~$0.08** |

---

## Queue Priority

CasaVid uses **LIVE priority** (same as VidNarrate user-initiated jobs):
- Jobs enter the existing queue alongside VidNarrate jobs
- First-come-first-served within LIVE priority
- Maximum 2 concurrent FFmpeg jobs maintained
- 30-minute timeout auto-releases stuck jobs

The server returns immediately with `{jobId, status: "queued"}` and processes in background.

---

## Error Handling

1. **Photo download fails**: Retry 3 times with exponential backoff
2. **OpenAI API fails**: Retry 2 times, then mark job as failed
3. **FFmpeg fails**: Log error, cleanup temp files, notify webhook
4. **Firebase upload fails**: Retry 3 times, notify webhook on final failure

---

## Monitoring

Existing endpoints work for CasaVid:
- `GET /active-jobs` - See current processing jobs
- `GET /queue-status` - Full queue details
- `GET /health` - Server health check

---

## Future Enhancements

1. **Captions/Subtitles**: Use `/burn-captions` endpoint with Whisper transcription
2. **Background Music**: Add optional music track mixing
3. **Custom Branding**: Watermark overlay for Premium users
4. **Multiple Aspect Ratios**: Support landscape (16:9) and square (1:1)
