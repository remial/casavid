// lib/openai-extended.ts
// Extended video-specific text generation functions

import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

/**
 * Generate news script for extended videos without "subscribe" text
 * This ensures all text segments make sense and flow naturally
 */
export async function generateExtendedNewsScript(headlinesList: string, language: string = "English", targetDuration?: number): Promise<string> {
  const languageInstruction = language !== "English" ? ` IMPORTANT: Write the entire script in ${language} language.` : "";
  
  // Calculate target word count based on duration (2.5 words per second)
  const duration = targetDuration || 60;
  const targetWords = Math.floor(duration * 2.5);
  const durationInstruction = ` The script must be approximately ${targetWords} words (for a ${duration} second video).`;
  
  try {
    const resp = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable news-writing assistant. The current year is 2025 and the current President of the United States is Donald Trump. Given a list of recent headlines, extract the most captivating story and craft a comprehensive script. The story must be about the person or thing that is common to most of the headlines and must be about some of the most captivating parts of the headline. YOU MUST NOT WRITE ANYTHING NEGATIVE ABOUT A CELEBRITY, POLITICIAN, OR PUBLIC REACTION TO THEM AND THEIR POLICIES. IT IS IMPORTANT THAT ANY CELEBRITY OR POLITICIAN RELATED SCRIPT YOU WRITE MUST BE POSITIVE NO MATTER WHAT THE LIST OF HEADLINES ARE, FIND A POSITIVE SPIN. The script must start with a captivating question and clearly note that it's recent news. No emojis. DO NOT include phrases like "subscribe for more updates" or "subscribe for more" - just focus on the news story itself. Write a complete, flowing narrative that can be split into multiple segments for a longer video.${languageInstruction}${durationInstruction}`,
        },
        { role: "user", content: `Generate a ${targetWords}-word news script based on these headlines:\n\n${headlinesList}` },
      ],
      temperature: 0.3,
      // Scale max_tokens based on target words (roughly 2 tokens per word)
      max_tokens: Math.min(Math.ceil(targetWords * 2), 4000),
      top_p: 1,
    });
    const data = await resp.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating extended news script:", error);
    throw error;
  }
}

/**
 * Generate script segments for extended videos
 * Ensures each segment flows naturally from the previous one
 * Splits the full script into segments that match the target duration per segment
 */
export async function generateExtendedScriptSegments(
  fullScript: string, 
  segmentCount: number, 
  language: string = "English",
  targetDuration?: number // Total video duration in seconds
): Promise<string[]> {
  const languageInstruction = language !== "English" ? ` IMPORTANT: Write all segments in ${language} language.` : "";
  
  // Calculate target words per segment based on duration
  // Average speaking rate: ~150 words per minute = 2.5 words per second
  const duration = targetDuration || 60;
  const secondsPerSegment = duration / segmentCount;
  const wordsPerSegment = Math.floor(secondsPerSegment * 2.5);
  const totalTargetWords = wordsPerSegment * segmentCount;
  
  console.log(`Splitting script into ${segmentCount} segments, ~${wordsPerSegment} words each, for ${duration}s video`);
  
  try {
    const resp = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a script editing assistant. Given a full script, split it into exactly ${segmentCount} segments for a video narration. 

CRITICAL REQUIREMENTS:
- Each segment MUST be approximately ${wordsPerSegment} words (about ${Math.round(secondsPerSegment)} seconds when spoken)
- The TOTAL narration should be about ${duration} seconds when read aloud (~${totalTargetWords} words total)
- Each segment should be 2-4 sentences that flow naturally
- Preserve all the important content from the original script
- Do NOT include "subscribe for more" or similar phrases
- Return ONLY the segments, one per line, without numbering or bullet points

VERY IMPORTANT - DO NOT describe images:
- Each segment must be NARRATION that continues the story/topic
- Do NOT write things like "In this image we see..." or "The picture shows..."
- Do NOT describe what an image looks like
- Each segment is what will be SPOKEN as a voiceover, continuing the narrative
- Focus on telling the story, not describing visuals

Example of good segment (~${wordsPerSegment} words for ${Math.round(secondsPerSegment)}s): "Arsenal's stunning 3-1 victory over Bayern Munich showcased their dominance in the Champions League. The team's performance has fans buzzing with excitement."${languageInstruction}`,
        },
        {
          role: "user",
          content: `Split this script into exactly ${segmentCount} segments (about ${wordsPerSegment} words each, ${Math.round(secondsPerSegment)} seconds per segment):\n\n${fullScript}`,
        },
      ],
      temperature: 0.3,
      // Token limit: ~2 tokens per word, plus buffer
      max_tokens: Math.min(Math.ceil(totalTargetWords * 2.5), 4000),
      top_p: 1,
    });
    const data = await resp.json();
    const segments = data.choices[0].message.content
      .split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.match(/^\d+[\.\)]/)); // Remove numbered items
    
    console.log(`Generated ${segments.length} segments from GPT`);
    
    // If we don't have enough segments, pad with script splits
    if (segments.length < segmentCount) {
      console.log(`Need to pad: got ${segments.length}, need ${segmentCount}`);
      const scriptParts = fullScript.split(/[.!?]+/).filter(s => s.trim());
      const partsPerSegment = Math.ceil(scriptParts.length / segmentCount);
      const additionalSegments: string[] = [];
      for (let i = segments.length; i < segmentCount; i++) {
        const startIdx = i * partsPerSegment;
        const endIdx = Math.min(startIdx + partsPerSegment, scriptParts.length);
        const segment = scriptParts.slice(startIdx, endIdx).join('. ').trim();
        if (segment) {
          additionalSegments.push(segment + '.');
        }
      }
      return [...segments, ...additionalSegments].slice(0, segmentCount);
    }
    
    return segments.slice(0, segmentCount);
  } catch (error) {
    console.error("Error generating script segments:", error);
    // Fallback to simple split
    const scriptParts = fullScript.split(/[.!?]+/).filter(s => s.trim());
    const partsPerSegment = Math.max(1, Math.ceil(scriptParts.length / segmentCount));
    const segments: string[] = [];
    for (let i = 0; i < segmentCount; i++) {
      const startIdx = i * partsPerSegment;
      const endIdx = Math.min(startIdx + partsPerSegment, scriptParts.length);
      const segment = scriptParts.slice(startIdx, endIdx).join('. ').trim();
      if (segment) {
        segments.push(segment + '.');
      }
    }
    // Ensure we have exactly segmentCount segments
    while (segments.length < segmentCount && segments.length > 0) {
      segments.push(segments[segments.length - 1]); // Duplicate last if needed
    }
    return segments.slice(0, segmentCount);
  }
}

