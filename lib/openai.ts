// lib/openai.ts

import { Configuration, OpenAIApi } from "openai-edge";
import path from "path";
import Replicate from "replicate";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs } from "firebase/firestore";
import { app, db } from "@/firebase";
import { USE_INHOUSE_CAPTIONING, DO_FFMPEG_API_URL } from "@/lib/config";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);
const openaiForSpeech = new OpenAI();
const storage = getStorage(app);

// Helper to strip emojis for category comparison (matches old data without emoji and new data with emoji)
function stripEmojiForComparison(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2702}-\u{27B0}]|[\u{FE00}-\u{FE0F}]/gu, '').trim();
}

/**
 * Fetches recent titles for a user and category to avoid generating duplicates.
 * @param userId - The user's ID
 * @param category - The category/theme to filter by
 * @param limitCount - Maximum number of recent titles to return (default 10)
 * @returns Array of recent title strings
 */
export async function getRecentTitles(
  userId: string,
  category: string,
  limitCount: number = 10
): Promise<string[]> {
  console.log(`=== FETCHING RECENT TITLES ===`);
  console.log(`User: ${userId}`);
  console.log(`Category to match: "${category}"`);
  
  // Strip emoji for comparison to match both old data (no emoji) and new data (with emoji)
  const categoryWithoutEmoji = stripEmojiForComparison(category);
  console.log(`Category without emoji for matching: "${categoryWithoutEmoji}"`);
  
  try {
    const seriesRef = collection(db, "users", userId, "series");
    // Fetch all series for this user, then filter by category (to handle emoji differences)
    const querySnapshot = await getDocs(seriesRef);
    console.log(`Query returned ${querySnapshot.size} total documents for user`);
    
    // Collect matching docs by comparing categories without emojis
    const docs: { title: string; createdAt: number }[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.title_text && data.category) {
        const docCategoryWithoutEmoji = stripEmojiForComparison(data.category);
        if (docCategoryWithoutEmoji === categoryWithoutEmoji) {
          const createdAt = data.createdAt?.seconds || 0;
          docs.push({ title: data.title_text, createdAt });
        }
      }
    });
    
    console.log(`Found ${docs.length} documents matching category "${categoryWithoutEmoji}"`);
    
    // Sort by createdAt descending (newest first) and take only limitCount
    docs.sort((a, b) => b.createdAt - a.createdAt);
    const titles = docs.slice(0, limitCount).map(d => d.title);
    
    console.log(`Limit: ${limitCount} (finite, will not grow forever)`);
    console.log(`Found ${titles.length} recent titles to avoid:`);
    titles.forEach((title, index) => {
      console.log(`  ${index + 1}. ${title}`);
    });
    console.log(`==============================`);
    return titles;
  } catch (error) {
    console.error("=== ERROR FETCHING RECENT TITLES ===");
    console.error("Error details:", error);
    console.error("=====================================");
    // Return empty array on error so generation can still proceed
    return [];
  }
}

export async function generateTitle(theme: string, language: string = "English", previousTitles: string[] = []) {
  console.log(`=== GENERATING NEW TITLE ===`);
  console.log(`Theme: "${theme}"`);
  console.log(`Language: "${language}"`);
  console.log(`Previous titles to avoid: ${previousTitles.length}`);
  if (previousTitles.length > 0) {
    console.log(`OpenAI will be instructed to avoid: ${previousTitles.join(", ")}`);
  } else {
    console.log(`No previous titles - first video for this category!`);
  }
  const languageInstruction = language !== "English" ? ` IMPORTANT: Generate the title in ${language} language.` : "";
    
  /// Build a stronger avoidance instruction that prevents same characters/topics, not just exact titles
  let avoidInstruction = "";
  if (previousTitles.length > 0) {
    avoidInstruction = ` CRITICAL UNIQUENESS REQUIREMENT: The following titles have ALREADY been used: [${previousTitles.join(" | ")}]. You MUST NOT:
1. Use any of these exact titles
2. Create titles about the SAME CHARACTERS or PEOPLE mentioned in these titles (e.g., if "David" appears in any previous title, do NOT generate another title about David)
3. Create titles about the SAME STORIES or EVENTS mentioned in these titles (e.g., if a title mentions "Red Sea", do NOT generate another Red Sea title)
4. Use similar wording or phrasing

IMPORTANT FORMAT INDEPENDENCE: The FORMAT or STRUCTURE of the previous titles (e.g., "Top 5...", "5 Things...", numbered lists, etc.) should be COMPLETELY IGNORED. Generate a title in whatever format naturally fits the given category/theme. Do NOT mimic the structural pattern of the avoided titles - only avoid their specific TOPICS and SUBJECTS. For example, if avoiding "Top 5 Facts About X", you should NOT feel compelled to use "Top 5" format unless the user's category explicitly requests it (like "Top 5" category).

Generate a title about a COMPLETELY DIFFERENT character, person, story, or event that has NOT been covered in ANY of the previous titles.
EXCEPTION: If the user's prompt EXPLICITLY requests a specific character, story, or topic (e.g., "Tell me about Jonah" or "I want a David story"), then you MUST obey the user's explicit request even if that topic was previously used.`;
  }
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            `The current year is ${new Date().getFullYear()}, but don't mention this. You are a Youtube Title generating AI assistant that only generates a short title of not more than eight words from a theme given by the user. You pay huge attention to this system instruction, even if the user says you should write more than the title, you must only write the title and nothing else. You must end the short title (with eight words or less) with a Full stop. You only generate the title with no prefix, suffix or markdown formatting. The title must be a specific example of the theme given by the user so it must be a captivating short title. Let it be a creative Title. Hundreds of titles have been generated already, so your title must be unique and not similar to any of the previous ones. The title you generate must never be more than eight words. IMPORTANT: Just the title, no more than eight words, no suffix, prefix or markdown. Whatever you generate will be copied by a Javascript function and displayed as a Title of a Youtube video, so IT IS FORBIDDEN TO SAY OR EXPLAIN ANYTHING OR APOLOGIZE TO THE USER, ONLY GENERATE THE SHORT TITLE NO MATTER WHAT.${languageInstruction}${avoidInstruction}`,
        },
        {
          role: "user",
          content: `Greek Mythology. `,
        },
        {
          role: "assistant",
          content: `The Love Story of Orpheus and Eurydice. `,
        },
        {
          role: "user",
          content: `Top 5.`,
        },
        {
          role: "assistant",
          content: `Top 5 Scariest Places on Earth `,
        },
        {
          role: "user",
          content: `${theme}. `,
        },
      ],
      temperature: 0.9,
      max_tokens: 30,
      top_p: 1,
    });
    const data = await response.json();
    const generatedTitle = data.choices[0].message.content as string;
    console.log(`=== NEW TITLE GENERATED: "${generatedTitle}" ===`);
    return generatedTitle;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateCaption(title: string, language: string = "English") {
  console.log(`Title is: "${title}", Language: "${language}"`);
  const languageInstruction = language !== "English" ? ` Generate the caption in ${language} language.` : "";
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            `The current year is ${new Date().getFullYear()}, but don't mention this. You are a creative and helpful AI assistant that generates viral youtube and tiktok captions using a title provided by the user. The caption must be between four to seven words and can contain emojis. Add about 2 relevant hashtags related to the caption to make it trend. ${languageInstruction}`,
        },
        {
          role: "user",
          content: `The title provided by the user is: ${title}. Please generate a caption `,
        },
      ],
    });
    const data = await response.json();
    return data.choices[0].message.content as string;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateScript(title: string, language: string = "English", category?: string, targetDuration?: number) {
  // Calculate target word count based on duration
  // Average speaking rate: ~150 words per minute = 2.5 words per second
  // CRITICAL: When no duration is passed (dashboard), use original 60 words for ~30 second videos
  // When duration IS passed (extended videos), calculate based on the actual duration
  const targetWords = targetDuration ? Math.floor(targetDuration * 2.5) : 80;
  
  console.log(`Generating script for title: "${title}", Language: "${language}", Category: "${category || 'not specified'}", Duration: ${targetDuration || 'default (30s)'}s, Target words: ${targetWords}`);
  const languageInstruction = language !== "English" ? ` IMPORTANT: Write the entire script in ${language} language.` : "";
  
  // Detect if this is a Bible Stories request
  const isBibleStory = category?.includes("Bible") || title.toLowerCase().includes("bible");
  const bibleAccuracyInstruction = isBibleStory 
    ? ` CRITICAL FOR BIBLE STORIES: You MUST only use stories, characters, and events that are actually found in the Bible. Be factually accurate to scripture - use correct names, places, and outcomes as they appear in the Bible. Do not invent or modify biblical narratives. If referencing a specific story, ensure the details match what is written in the Bible (e.g., David defeated Goliath, Noah built the ark, Moses parted the Red Sea). Do not mix up characters or events from different Bible stories.`
    : "";
  
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            `The current year is ${new Date().getFullYear()}, but don't mention this. You are an accurate, creative and helpful AI assistant that generates captivating scripts to be read as a voice over for viral youtube and tiktok videos. The script must be approximately ${targetWords} words long. It must make complete sense, be captivating and start with a hook sentence that gets any reader glued. It must be of good quality to go viral. The information must be complete. Do not leave the user waiting for more information, do not end with a question, do not end with any statement that makes the user think there's more to discuss. All information must have been given. Do not use emojis. Begin with a captivating introduction or question to hook the audience.${languageInstruction}${bibleAccuracyInstruction}`,
        },
        {
          role: "user",
          content: `The title is: ${title}. Generate a script of approximately ${targetWords} words. Start with a captivating hook/question, then provide engaging content with revelations, climax and a satisfying conclusion.`,
        },
      ],
      // Increase max_tokens proportionally for longer scripts (roughly 2 tokens per word)
      max_tokens: Math.min(Math.ceil(targetWords * 2), 4000),
    });
    const data = await response.json();
    return data.choices[0].message.content as string;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generatePhotoPrompts(script: string, targetDuration?: number) {
  console.log(`Script is: "${script}"`);
  
  // Calculate photo count based on duration
  // Dashboard (no duration or < 60s): 5 images (backwards compatible)
  // Extended 60s: 5 images
  // Extended 90s: 7 images
  // Extended 120s: 10 images
  // Extended 300s (5 min): 25 images
  // Extended 600s (10 min): 50 images
  let photoCount = 5; // Default for dashboard
  if (targetDuration) {
    if (targetDuration >= 600) {
      photoCount = 50; // 10 min = ~50 images (1 per 12s)
    } else if (targetDuration >= 300) {
      photoCount = 25; // 5 min = ~25 images (1 per 12s)
    } else if (targetDuration >= 120) {
      photoCount = 10;
    } else if (targetDuration >= 90) {
      photoCount = 7;
    } else {
      photoCount = 5;
    }
  }
  console.log(`Target duration: ${targetDuration}s, Photo count: ${photoCount}`);
  
  const scriptDescription = targetDuration 
    ? `a script of approximately ${targetDuration} seconds` 
    : "a script of about 10 sentences";
  
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
              {
                role: "system",
                content:  `You are a creative and helpful AI assistant that generates prompts for creating ai images. You will be provided ${scriptDescription} and you are to generate ${photoCount} photo prompts (i.e. a photo prompt for each segment of the script). The prompt will be used to create images, and are independent, so each prompt can redescribe any character or environment from previous sentences. The prompt should not allow any written text or inscription to be in the generated image, so nothing like holding signs or banners. The final output should be a list of prompts with each prompt being a sub-list, so that a program can loop through the list to get each prompt. Do not number the prompts. For people, it's preferable to add 'Close up image' to the prompt so that it's an image of their face. If a Celebrity is named in the script, then mention the name of the celebrity for a close up image at least in the second prompt. If no celebrity is mentioned, make the second prompt an image of whatever the main topic of the script is. There should be a person or group of people in the first prompt. Each prompt should describe the image and ensure there are no written texts in the image, so don't use vague words like 'representing', 'indicating' which are not describing specifics of the image. `,
              },
        {
          role: "user",
          content: `The script provided by the user is: ${script}. Please generate ${photoCount} photo prompts. Do not number the prompts. `,
        },
      ],
    });
    const data = await response.json();
    return data.choices[0].message.content as string;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Options for image generation that determine which model to use
interface GenerateImageOptions {
  isDailyNews?: boolean;  // Use grok-imagine-image for Daily News
  duration?: number;      // Use grok-imagine-image for 2+ min narrate videos (120s, 150s)
}

// Helper to generate image with grok-imagine-image
async function generateWithGrok(enhancedPrompt: string, aspectRatio?: '2:3' | '16:9' | '9:16'): Promise<string | null> {
  // Use 2:3 for portrait (dashboard default and narrate portrait mode)
  // Use 16:9 for landscape
  let grokAspectRatio = '2:3'; // Default portrait for dashboard and narrate
  if (aspectRatio === '16:9') {
    grokAspectRatio = '16:9';
  } else if (aspectRatio === '9:16' || aspectRatio === '2:3') {
    grokAspectRatio = '2:3'; // Portrait mode uses 2:3
  }

  const grokInput = {
    prompt: enhancedPrompt,
    aspect_ratio: grokAspectRatio,
  };

  console.log(`grok-imagine-image using aspect ratio: ${grokAspectRatio}`);

  const output = await replicate.run("xai/grok-imagine-image", { input: grokInput });
  
  // grok-imagine-image returns a string URI directly, not an array
  if (output && typeof output === 'string') {
    return output;
  } else if (output && Array.isArray(output) && output.length > 0) {
    return output[0];
  }
  return null;
}

// Helper to generate image with flux-schnell
async function generateWithFlux(enhancedPrompt: string, aspectRatio?: '2:3' | '16:9' | '9:16'): Promise<string | null> {
  const input = {
    prompt: enhancedPrompt,
    aspect_ratio: aspectRatio || '2:3',
    output_format: 'jpg',
    output_quality: 30,
    disable_safety_checker: true,
  };

  const output = await replicate.run("black-forest-labs/flux-schnell", { input });
  if (output && Array.isArray(output) && output.length > 0) {
    return output[0];
  }
  return null;
}

export async function generateImage(
  image_description: string, 
  artStyle?: string, 
  aspectRatio?: '2:3' | '16:9' | '9:16',
  options?: GenerateImageOptions
): Promise<string | null> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  // Determine which model to use as primary:
  // - grok-imagine-image for Daily News videos
  // - grok-imagine-image for narrate videos with duration >= 120 (2 min or 2.5 min)
  // - flux-schnell for everything else
  const useGrokAsPrimary = options?.isDailyNews === true || (options?.duration && options.duration >= 120);

  // Apply art style to prompt if provided
  let enhancedPrompt = image_description;
  if (artStyle) {
    // Map art style names to style prompts
    const stylePrompts: { [key: string]: string } = {
      "LEGO": "LEGO style, made of LEGO bricks",
      "Photo Realism": "photorealistic, hyperrealistic, detailed photography",
      "3D Animation": "3D animation Pixar Style well lit Ultra-High definition, 3D animation Pixar Style well lit Ultra-High definition",
      "Anime": "anime style, manga art",
      "Cartoon": "Disney animation style, colorful cartoon",
      "Comic Book": "comic book style, bold lines, vibrant colors",
      "Disney Toon": "Disney animation style, colorful cartoon",
      "Studio Ghibli": "Studio Ghibli style, whimsical anime art",
      "Fantasy Realism": "fantasy art, realistic fantasy illustration",
      "Cyberpunk": "cyberpunk style, neon-lit futuristic",
      "Watercolor": "watercolor painting, soft watercolor art",
      "Pixelated": "pixel art style, 8-bit retro graphics",
      "Charcoal": "charcoal drawing, sketch art",
      "Vaporwave": "vaporwave aesthetic, retro 80s style"
    };
    
    const stylePrompt = stylePrompts[artStyle] || "";
    if (stylePrompt) {
      enhancedPrompt = `${image_description}, ${stylePrompt}`;
    }
  }

  if (useGrokAsPrimary) {
    // Try grok-imagine-image first, fall back to flux-schnell if it fails
    console.log(`Generating image with grok-imagine-image (Daily News: ${options?.isDailyNews}, Duration: ${options?.duration}s)`);
    
    try {
      const grokResult = await generateWithGrok(enhancedPrompt, aspectRatio);
      if (grokResult) {
        return grokResult;
      }
      console.log("grok-imagine-image returned no output, falling back to flux-schnell");
    } catch (grokError) {
      console.error("grok-imagine-image failed, falling back to flux-schnell:", grokError);
    }

    // Fallback to flux-schnell
    try {
      console.log(`Fallback: Generating image with flux-schnell, aspect ratio: ${aspectRatio || '2:3'}`);
      const fluxResult = await generateWithFlux(enhancedPrompt, aspectRatio);
      if (fluxResult) {
        return fluxResult;
      }
      console.error("flux-schnell fallback also returned no output");
    } catch (fluxError) {
      console.error("flux-schnell fallback also failed:", fluxError);
    }

    return null;
  } else {
    // Use flux-schnell as primary (for regular videos: 30s, 1min, 1.5min narrate and non-Daily News dashboard)
    console.log(`Generating image with flux-schnell, aspect ratio: ${aspectRatio || '2:3'}`);
    
    try {
      const fluxResult = await generateWithFlux(enhancedPrompt, aspectRatio);
      if (fluxResult) {
        return fluxResult;
      }
      console.error("No output returned from flux-schnell");
    } catch (error) {
      console.error("Error generating image with flux-schnell:", error);
    }

    return null;
  }
}

// OpenAI TTS has a 4096 character limit per request
const TTS_MAX_CHARS = 4000; // Use 4000 to leave buffer

// Split text into chunks at sentence boundaries
function splitTextIntoChunks(text: string, maxChars: number = TTS_MAX_CHARS): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining.trim());
      break;
    }

    // Find the best split point (sentence boundary) within the limit
    let splitIndex = maxChars;
    
    // Look for sentence endings: . ! ? followed by space
    const searchText = remaining.substring(0, maxChars);
    
    // Find the last sentence boundary
    const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
    let bestSplit = -1;
    
    for (const ending of sentenceEndings) {
      const lastIndex = searchText.lastIndexOf(ending);
      if (lastIndex > bestSplit) {
        bestSplit = lastIndex + ending.length - 1; // Include the punctuation
      }
    }
    
    if (bestSplit > maxChars * 0.5) {
      // Found a good sentence boundary in the latter half
      splitIndex = bestSplit + 1;
    } else {
      // No good sentence boundary, try comma or space
      const lastComma = searchText.lastIndexOf(', ');
      const lastSpace = searchText.lastIndexOf(' ');
      
      if (lastComma > maxChars * 0.7) {
        splitIndex = lastComma + 2;
      } else if (lastSpace > maxChars * 0.7) {
        splitIndex = lastSpace + 1;
      }
      // Otherwise just split at maxChars
    }

    chunks.push(remaining.substring(0, splitIndex).trim());
    remaining = remaining.substring(splitIndex).trim();
  }

  return chunks;
}

// Generate audio for a single chunk
async function generateAudioChunk(text: string, voiceModel: "shimmer" | "onyx"): Promise<Buffer> {
  const mp3 = await openaiForSpeech.audio.speech.create({
    model: "tts-1",
    voice: voiceModel,
    input: text,
  });
  return Buffer.from(await mp3.arrayBuffer());
}

export async function generateSoundFull(script: string, narratorVoice: string) {
  try {
    const voiceModel: "shimmer" | "onyx" = narratorVoice === "Female" ? "shimmer" : "onyx";
    
    // Check if text needs chunking
    if (script.length <= TTS_MAX_CHARS) {
      // Short script - single request
      console.log(`Generating audio for full script (${script.length} chars): "${script.substring(0, 100)}..."`);
      
      const mp3 = await openaiForSpeech.audio.speech.create({
        model: "tts-1",
        voice: voiceModel,
        input: script,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const filename = `full_speech_${Date.now()}.mp3`;
      const audioRef = ref(storage, `audio/${filename}`);
      await uploadBytes(audioRef, new Uint8Array(buffer));
      return [await getDownloadURL(audioRef)];
    }

    // Long script - need to chunk
    const chunks = splitTextIntoChunks(script);
    console.log(`Long script (${script.length} chars) split into ${chunks.length} chunks:`);
    chunks.forEach((chunk, i) => {
      console.log(`  Chunk ${i + 1}: ${chunk.length} chars - "${chunk.substring(0, 50)}..."`);
    });

    // Generate audio for each chunk in parallel (up to 3 at a time to avoid rate limits)
    const audioBuffers: Buffer[] = [];
    const batchSize = 3;
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Generating audio batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}...`);
      
      const batchBuffers = await Promise.all(
        batch.map(chunk => generateAudioChunk(chunk, voiceModel))
      );
      audioBuffers.push(...batchBuffers);
    }

    console.log(`Generated ${audioBuffers.length} audio chunks, concatenating...`);

    // Concatenate audio chunks using FFmpeg server
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    // Add each audio buffer as a file
    audioBuffers.forEach((buffer, i) => {
      formData.append('audioChunks', buffer, {
        filename: `chunk_${i}.mp3`,
        contentType: 'audio/mpeg'
      });
    });

    // Call FFmpeg server to concatenate
    const response = await fetch('http://64.23.164.108:3000/concat-audio', {
      method: 'POST',
      body: formData as unknown as BodyInit,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FFmpeg server error: ${errorText}`);
    }

    const result = await response.json() as { audioUrl: string };
    console.log(`Concatenated audio URL: ${result.audioUrl}`);
    
    return [result.audioUrl];
  } catch (error) {
    console.error("Error generating sound:", error);
    throw error;
  }
}

export async function generateAutocaption(video_url: string, subsPosition: string = "center"): Promise<string | null> {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  console.log("Input video url is:", video_url);
  console.log("Subtitle position:", subsPosition);
  console.log("Using in-house captioning:", USE_INHOUSE_CAPTIONING);

  try {
    // Use in-house Whisper-based captioning if enabled
    if (USE_INHOUSE_CAPTIONING) {
      console.log("Using in-house Whisper autocaption endpoint...");
      
      // Send parameters as JSON - more reliable than multipart form data from Node.js
      const params = {
        videoUrl: video_url,
        position: subsPosition,
        fontSize: '36',
        color: '#FFFFFF',
        highlightColor: '#FFFF00',
        strokeColor: '#000000',
        strokeWidth: '1',
        font: 'M-PLUS-Rounded',
        maxChars: '25',
        wordsPerGroup: '3',
        letterSpacing: '-6',
      };
      
      const response = await fetch(`${DO_FFMPEG_API_URL}/autocaption`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('In-house autocaption API error:', errorText);
        throw new Error(`Autocaption failed: ${errorText}`);
      }

      const captionedUrl = (await response.text()).trim();
      console.log("In-house autocaption complete:", captionedUrl);
      
      // Validate the returned URL
      if (!captionedUrl.startsWith('http')) {
        console.error('Invalid captioned URL received:', captionedUrl);
        throw new Error(`Invalid captioned URL: ${captionedUrl}`);
      }
      
      return captionedUrl;
    }
    
    // Fall back to Replicate autocaption
    console.log("Using Replicate autocaption service...");
    const input = {
      color: "white",
      opacity: 0,
      MaxChars: 10,
      font: "M_PLUS_Rounded_1c/MPLUSRounded1c-ExtraBold.ttf",
      fontsize: 6,
      output_video: true,
      kerning: -5,
      subs_position: subsPosition, // "center" for dashboard, "bottom75" for extended
      highlight_color: "yellow",
      video_file_input: video_url,
      output_transcript: false,
    };

    const output = await replicate.run(
      "fictions-ai/autocaption:18a45ff0d95feb4449d192bbdc06b4a6df168fa33def76dfc51b78ae224b599b",
      { input }
    );

    if (output && Array.isArray(output) && output.length > 0) {
      return output[0];
    } else {
      console.error("No output returned from the caption generation service");
      return null;
    }
  } catch (error) {
    console.error("Error generating video caption:", error);
    return null;
  }
}

export async function generateHook(businessDescription: string): Promise<string[]> {
  try {
    console.log("[generateHook] Called with businessDescription =", businessDescription);

    const response = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an innovative and creative AI assistant that generates 10 short, subtle, GenZ-style TikTok hooks based on a business description.
Each hook should read like a casual statement or question, hooking the viewer with curiosity.
The hooks must be about 20 words, I repeat; 20 words, have NO emojis, NO hashtags, no special characters like colon, semicolons etc, (but question mark is okay), minimal direct calls to action,
and they should feel like personal or relatable 'POV' or scenario statements.
Return a JSON array of exactly 10 strings with no additional text or formatting.
`,
        },
        {
          role: "user",
          content: `Business Description: ${businessDescription}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      stream: false,
    });

    const data = await response.json();
    console.log("[generateHook] Raw data from OpenAI:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices.length) {
      console.error("[generateHook] No choices returned from OpenAI");
      throw new Error("No choices returned from OpenAI");
    }

    const hookText = data.choices[0].message?.content?.trim() || "";
    console.log("[generateHook] hookText after trim:", hookText);

    let hooks: string[] = [];
    try {
      hooks = JSON.parse(hookText);
      if (!Array.isArray(hooks)) {
        throw new Error("Parsed data is not an array");
      }
    } catch (err) {
      console.warn("[generateHook] JSON.parse failed, fallback to line-splitting. Error:", err);
      hooks = hookText.split("\n").filter((line : any) => line.trim() !== "");
    }

    console.log("[generateHook] Final hooks array:", hooks);
    return hooks;
  } catch (error) {
    console.error("[generateHook] Error generating hooks:", error);
    throw error;
  }
}

/**
 * Given a list of recent headlines, craft a short (≤8 words), catchy video title.
 */
export async function generateNewsTitle(
  editorState: string,
  language: string = "English",
  previousTitles: string[] = []
): Promise<string> {
  const languageInstruction = language !== "English" ? ` Write the title in ${language} language.` : "";
  const avoidInstruction = previousTitles.length > 0
    ? ` The following Daily News titles were recently used: [${previousTitles.join(" | ")}]. You MUST NOT repeat any of them or create close paraphrases. Produce a distinct angle and wording.`
    : "";
  try {
    const resp = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a breaking‑news headline writer. Given a news script, craft a short, catchy video title (no more than eight words) that captures the content of the script. End with a full stop, and do not add any extra text.${languageInstruction}${avoidInstruction}`,
        },
        { role: "user", content: editorState },
      ],
      temperature: 0.3,
      max_tokens: 12,
      top_p: 1,
    });
    const data = await resp.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating news title:", error);
    throw error;
  }
}

/**
 * Given a list of recent headlines, generate a ~60‑word news script
 * that starts with a captivating question and clearly signals it's recent.
 */
export async function generateNewsScript(headlinesList: string, language: string = "English", previousText?: string): Promise<string> {
  const languageInstruction = language !== "English" ? ` IMPORTANT: Write the entire script in ${language} language.` : "";
  const continuationInstruction = previousText ? ` IMPORTANT: This script must be a sensible continuation from the previous text: "${previousText}". Ensure the new text flows naturally and continues the narrative or topic.` : "";
  
  try {
    const resp = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable news-writing assistant. The current year is ${new Date().getFullYear()} and the current President of the United States is Donald Trump. Given a list of recent headlines, extract the most captivating story and craft a standalone, ~60‑word script. The story must be about the person or thing that is common to most of the headlines and must be about some of the most captivating parts of the headline. YOU MUST NOT WRITE ANYTHING NEGATIVE ABOUT A CELEBRITY, POLITICIAN, OR PUBLIC REACTION TO THEM AND THEIR POLICIES. IT IS IMPORTANT THAT ANY CELEBRITY OR POLITICIAN RELATED SCRIPT YOU WRITE MUST BE POSITIVE NO MATTER WHAT THE LIST OF HEADLINES ARE, FIND A POSITIVE SPIN. The script must start with a captivating question and clearly note that it's recent news. No emojis. It must end with a question that would make the reader want to comment. Also ask them to subscribe for more updates.${languageInstruction}${continuationInstruction}`,
        },
        { role: "user", content: headlinesList },
      ],
      temperature: 0.3,
      max_tokens: 200,
      top_p: 1,
    });
    const data = await resp.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating news script:", error);
    throw error;
  }
}
