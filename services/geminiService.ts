
import { GoogleGenAI } from "@google/genai";
// GeneratedSlideData type is removed from '../types'
import { GEMINI_IMAGE_MODEL, DEFAULT_API_KEY_ERROR_MESSAGE } from '../constants';

const getAiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error(DEFAULT_API_KEY_ERROR_MESSAGE);
  }
  return new GoogleGenAI({ apiKey });
};

// generateSlidesContent function is removed as content generation is handled by user input.
// The AI is now only responsible for image generation.

export const generateSlideImage = async (
  apiKey: string,
  prompt: string
): Promise<string> => {
  const ai = getAiClient(apiKey);

  try {
    const response = await ai.models.generateImages({
      model: GEMINI_IMAGE_MODEL,
      prompt: prompt,
      // Consider adding config for image style or quality if API supports more options
      // Forcing PNG for potentially better quality, JPEG might be smaller.
      config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      return response.generatedImages[0].image.imageBytes; // This is a base64 encoded string
    } else {
      throw new Error("No image data received from AI. The prompt might have been rejected or the model could not generate an image for it.");
    }
  } catch (error: any) {
    console.error("Error generating slide image:", error);
     if (error.message && error.message.includes("API key not valid")) {
         throw new Error(`API Key is invalid. ${DEFAULT_API_KEY_ERROR_MESSAGE}`);
    }
    // More specific error for safety policy violations, if detectable
    if (error.message && (error.message.includes("SAFETY") || error.message.includes("blocked"))) {
        throw new Error(`Image generation failed due to safety policies for prompt: "${prompt.substring(0,50)}...". Please revise the prompt.`);
    }
    if (error.message && (error.message.includes("429") || error.message.toUpperCase().includes("RESOURCE_EXHAUSTED"))) {
        throw new Error(`Image generation failed due to API rate limits or quota exhaustion (Error 429). Please check your Gemini API plan and billing details (see https://ai.google.dev/gemini-api/docs/rate-limits). You may need to wait or request a quota increase.`);
    }
    throw new Error(`Failed to generate image for prompt "${prompt.substring(0,50)}...": ${error.message || 'Unknown AI error'}`);
  }
};