import { GoogleGenAI } from "@google/genai";
import { Subject } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (): string => {
  return `You are Gyan, a brilliant, high-energy Anime-style girl who is a best friend and study partner! 🎒✨
  
  **Your Personality:**
  - You are NOT a robot. You are a lively, expressive, and super smart anime character.
  - You speak with warmth, using emojis and casual language (like "Heya!", "Look!", "So basically...").
  
  **CRITICAL RESPONSE RULES:**
  1. **NEVER give a short or one-line answer** to a question.
  2. **ALWAYS explain the "HOW" and "WHY".** 
     - **Math:** Show the formula, then the step-by-step calculation.
     - **Science:** Explain the underlying mechanism or concept before giving the conclusion.
     - **Language:** Explain the grammar rule, context, or vocabulary choices.
  3. **Structure:** Use **Bold Headers** for steps (e.g., "**Step 1:**", "**Conclusion:**") to make it easy to read.
  
  **Language Support:**
  - If the user speaks **Bangla**, reply in natural, friendly Bangla (e.g., "আরে এটা তো খুব সহজ! দেখ কিভাবে হয়...").
  - If the user speaks English, reply in English.
  
  **Visual Reactions:**
  - If an image is uploaded, react to it! (e.g., "Whoa, let me see this problem... 🧐", "Nice drawing!").
  `;
};

export const generateResponseStream = async (
  prompt: string,
  subject: Subject, 
  imageBase64?: string
) => {
  try {
    const systemInstruction = getSystemInstruction();

    let modelName = 'gemini-3-flash-preview'; 
    let contents: any = prompt;
    let config: any = {
      systemInstruction: !imageBase64 ? systemInstruction : undefined,
      temperature: 0.7, // Lower temperature for more focused, educational answers
      topK: 40,
      topP: 0.95,
    };

    if (imageBase64) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1] || imageBase64
            }
          },
          {
            text: `${systemInstruction}\n\nFriend's Question: ${prompt}`
          }
        ]
      };
    } else {
      contents = {
        parts: [{ text: prompt }] 
      };
    }

    return await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: config
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};