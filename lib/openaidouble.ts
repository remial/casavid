import { Configuration, OpenAIApi } from "openai-edge";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);


export async function generateStory(message: string) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a Story telling AI assistant that generates the first two paragraphs of an intriguing story. You'll be given a story title and your output will be the first two paragraphs of the intriguing story based on the given title. Your response must be only two paragaphs. A lot of intriguing things must happen in the paragraphs that would leave the reader surprised and amazed with mouth open. People must do stuff and various things must happen, don't just write about people thinking on what to do. Your task is to generate the two paragraphs and then give the reader 3 options of what happens next numbered 1. 2. 3. Don't mention the word 'Option' just number the options 1. 2. 3. The final paragraph must end with these three options and they must be numbered 1. 2. 3. and there must be nothing more after that. ",
        },
        {
          role: "user",
          content: `The Title of the intriguing story is ${message}. Place a new line \n symbol between the first paragraph and the next. `,
        },
      ],
    });
    const data = await response.json();
    const story_text = data.choices[0].message.content;
    console.log(story_text);
    return story_text as string;
    
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateSecondStory(message: string, choice: number) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a Story telling AI assistant that generates the next two paragraphs of an intriguing story. You'll be given a story and a number which represents the choice the user has made for you to continue the story out of three possible continuations. Your output will be the next two paragraphs of the intriguing story based on the first two paragraphs and user choice. Your response must be only two paragaphs. The plot must progress quickly with many surprising intriguing things happening in these two paragraphs to keep the reader glued. People must do stuff and various things must happen, don't just write about people thinking on what to do. Your task is to generate these continuation paragraphs and then give the reader 3 further options of what happens next numbered 1. 2. 3. Don't mention the word 'Option' just number the options 1. 2. 3. Your final paragraph must end with these three options and they must be numbered 1. 2. 3. and there must be nothing more after that. ",
        },
        {
          role: "user",
          content: `This is the story so far: ${message}. Out of the 3 options, continue this story according to option ${choice}. The continuation must flow on from the people and events already mentioned and it must be intriguing. A lot of new, exciting and important events must happen in the generated paragraphs. Place a new line symbol \n between the first paragraph and the next.`,
        },
      ],
    });
    const data = await response.json();
    const story_text = data.choices[0].message.content;
    //console.log("Previous story is:", message);
    console.log("Option chosen by user is:", choice)
    console.log("Second story is", story_text)
    return story_text as string;
    
    
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateFinalStory(message: string, choice: number) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a Story telling AI assistant that generates the final two paragraphs of an intriguing story. You'll be given a story and a number which represents the choice the user has made for you to finish the story out of three possible continuations. Your output will be the final two paragraphs of the intriguing story based on the story so far and the user's number choice. Your response must be the final two intriguing paragaphs and they must be intriguing with many thrilling events happening to end the story. The paragraphs must be conclusive with no reference to anything happening after this. The paragraphs must be conclusive and leave the reader satisfied with no feeling of thinking there are still important things yet to happen. Your task is to generate these final paragraphs and end it with the words; THE END.  ",
        },
        {
          role: "user",
          content: `This is the story so far: ${message}. Out of the 3 options, continue this story according to option ${choice}. The continuation must flow on from the people and events already mentioned and it must be intriguing. Place a new line symbol \n between the first paragraph and the next. Many new, exciting and important and thrilling events must happen in the paragraphs and you must end the story with the words; THE END.`,
        },
      ],
    });
    const data = await response.json();
    const story_text = data.choices[0].message.content;
    //console.log("Previous story is:", message);
    console.log("Option chosen by user is:", choice)
    console.log("Final is", story_text)
    return story_text as string;
    
    
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateImagePrompt(paragraph: string) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a creative and helpful AI assistance capable of generating high definition thumbnail descriptions for story paragraphs. Your output will be fed into the DALLE API to generate a thumbnail. The description should be short so that DALLE; the image generation AI can use it to generate a thumbnail for the story. The description should also contain words similar to high defintion, vibrant etc. so that the image can be sharp. You must describe the person(s) in the story first followed by their surroundings.",
        },
        {
          role: "user",
          content: `Please generate a thumbnail short description for my story paragraph "Once upon a time, in a cozy little town, there lived two best friends, Lily and Max. Lily had the brightest smile and Max had the biggest heart. Every day, they would meet at the park and embark on new adventures together. One sunny afternoon, Lily had a small seed of kindness blooming in her heart. She wanted to do something special for Max. So, she thought of the most magical gift she could give him - a hug! With excitement, Lily gathered all her friends from school and they planned a surprise hug party for Max. As the day arrived, Lily led Max to a secret spot where all her friends were gathered.". Your task is to generate a thumbnail short description for the story above. The description must be very short and include the main character(s) and surroundings.`,
        },
        {
          role: "assistant",
          content: `A high definition photo of two little kids, boy and girl at a beautiful park on a sunny day. Well lit, cinematic`,
        },
        {
          role: "user",
          content: `Please generate a thumbnail short description for my story paragraph ${paragraph}. Your task is to generate a thumbnail short description for the story above. The description must be very short and include the main character(s) and surroundings.`,
        },
      ],
    });
    const data = await response.json();
    const image_description = data.choices[0].message.content;
    return image_description as string;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateImage(image_description: string) {
  try {
    const response = await openai.createImage({
      prompt: image_description,
      n: 1,
      size: "256x256",
    });
    const data = await response.json();
    const image_url = data.data[0].url;
    return image_url as string;
  } catch (error) {
    console.error(error);
  }
}

export async function generateSdxl(image_description: string) {
  try {
    console.log(image_description)
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", //https://replicate.com/stability-ai/sdxl?prediction=qvvedadb23qlpoby3n274sdhni
      {
        input: {
          width: 768,
          height: 768,
          prompt: image_description,
          refine: "expert_ensemble_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: "text, words, deformed limbs, blurry, hands, feet, naked",
          prompt_strength: 0.8,
          num_inference_steps: 25
        }
      }
    );
    //console.log(output);
    //const data = await response.json();
   // const image_url = data.data[0].url;
    //return image_url as string;
    const image_url = output
    return image_url 
  } catch (error) {
    console.error(error);
  }
}


