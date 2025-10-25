import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AspectRatio, ImageData, StylePreset } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Parses errors from the Gemini API and returns a user-friendly error message.
 * @param error The error object caught from the API call.
 * @returns An Error object with a user-friendly message.
 */
const handleGeminiError = (error: any): Error => {
  console.error("Gemini API Error:", error);
  let message = "An unexpected error occurred. Please try again later.";

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // Check for safety-related blocks
    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      message = "Your request was blocked due to safety settings. Please modify your prompt and try again.";
    } 
    // Check for quota issues
    else if (errorMessage.includes('quota')) {
      message = "You have exceeded your API quota. Please check your Google AI Studio account for details.";
    }
    // Check for invalid argument or bad request
    else if (errorMessage.includes('400') || errorMessage.includes('bad request') || errorMessage.includes('invalid argument')) {
      message = "There was an issue with the request. Please ensure your prompt, images, and settings are valid.";
    }
    // Generic server error
    else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
      message = "The server encountered an error. Please wait a moment and try again.";
    } else if (error.message) {
      // Use the original message if it's one of our custom ones.
      const customErrors = [
        "No image was generated", 
        "No edited image was returned", 
        "The model did not return a refined prompt"
      ];
      if (customErrors.some(e => error.message.includes(e))) {
        message = error.message;
      }
    }
  }
  
  return new Error(message);
};


export const generateImage = async (prompt: string, aspectRatio: AspectRatio, style: StylePreset): Promise<string> => {
  const fullPrompt = `${prompt}, ${style} style`;
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    
    throw new Error("No image was generated. The model may not have been able to fulfill the request.");
  } catch (error) {
    throw handleGeminiError(error);
  }
};

export const getPromptSuggestions = async (image: ImageData): Promise<string[]> => {
  try {
    const textPart = {
      text: `Analyze this product image. Provide 3 concise and creative prompts for an e-commerce photoshoot. The prompts should suggest a new background, lighting, and props to make the product look more appealing. The output must be a valid JSON array of strings.

      Example output:
      [
        "Place the product on a rustic wooden table with warm, soft lighting from the side.",
        "Create a minimalist scene with a solid pastel background and a single, elegant prop.",
        "Showcase the product on a reflective black surface with dramatic, cinematic lighting."
      ]`
    };

    const imagePart = {
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType,
      },
    };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          }
        },
      },
    });

    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    
    if (Array.isArray(suggestions) && suggestions.every(item => typeof item === 'string')) {
      return suggestions;
    } else {
      throw new Error("Invalid JSON response format for suggestions.");
    }

  } catch (error) {
    throw handleGeminiError(error);
  }
};

export const editImage = async (prompt: string, images: ImageData[]): Promise<string> => {
  if (images.length === 0) {
    throw new Error("At least one image must be provided for editing.");
  }

  try {
    const imageParts = images.map(image => ({
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType,
      },
    }));

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No edited image was returned. Try adjusting your prompt for a clearer instruction.");
  } catch (error) {
    throw handleGeminiError(error);
  }
};

export const refinePromptFromBanglish = async (banglishPrompt: string, referenceImage?: ImageData | null): Promise<string> => {
  try {
    let contents: any;
    
    if (referenceImage) {
      // Multi-modal prompt with reference image
      const instruction = `You are an expert prompt engineer for AI image generation. Your task is to create a detailed prompt for editing a primary product image based on a reference image's style.

1. **Analyze the Reference Image's Style**: Examine the reference image for its artistic style, focusing on:
   - **Lighting**: e.g., soft, hard, dramatic, natural, direction.
   - **Color Palette**: e.g., warm, cool, monochromatic, dominant colors.
   - **Composition**: e.g., centered, minimalist, rule of thirds.
   - **Mood & Atmosphere**: e.g., luxurious, rustic, professional, cozy.
   - **Background & Environment**: e.g., studio, nature, abstract.

2. **Interpret the User's Goal**: The user's text is: "${banglishPrompt}". Translate this to understand their core intent.

3. **Synthesize the Final Prompt**: Create a single, professional, descriptive prompt. This new prompt must instruct the AI to do the following:
   - Place the user's main product into a new scene.
   - The new scene's style (lighting, background, mood) must perfectly match the style you analyzed from the reference image.
   - **Crucially, the prompt must explicitly state that the product itself—its color, shape, material, texture, and any logos or text—must remain IDENTICAL and UNCHANGED from the original product image.** The goal is to change ONLY the environment, not the product.

**Output Format**: The final output must be ONLY the refined English prompt string, with no extra text, labels, titles, or explanations.`;
      
      const textPart = { text: instruction };
      const imagePart = {
        inlineData: {
          data: referenceImage.base64,
          mimeType: referenceImage.mimeType,
        },
      };
      contents = { parts: [textPart, imagePart] };

    } else {
      // Text-only prompt
      const instruction = `You are an expert prompt engineer for AI image generation. Your task is to interpret the following text, which may be in Bangla, English, or a mix (Banglish). Translate it into clear English, then rewrite it into a professional, descriptive, and effective prompt suitable for a high-quality e-commerce product image. The final output must be ONLY the refined English prompt string, with no extra text, labels, or explanations.`;
      contents = `${instruction}\n\nInput Text: "${banglishPrompt}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    const refinedPrompt = response.text.trim();
    if (!refinedPrompt) {
      throw new Error("The model did not return a refined prompt.");
    }
    return refinedPrompt;

  } catch(error) {
    throw handleGeminiError(error);
  }
};