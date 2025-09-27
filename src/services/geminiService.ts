import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { GeminiResponse } from '../types';


export const editImageWithGemini = async (base64ImageData: string, mimeType: string, prompt: string, apiKey: string): Promise<GeminiResponse | null> => {
    
    if (!apiKey) {
      throw new Error("API-ключ не предоставлен.");
    }

    const ai = new GoogleGenAI({ apiKey });
  
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

    const candidate = response?.candidates?.[0];

    if (candidate) {
        const result: GeminiResponse = { image: null, text: null };
        
        // Safely access parts to prevent crash if content is missing
        if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.text) {
                    result.text = part.text;
                } else if (part.inlineData) {
                    result.image = part.inlineData.data;
                }
            }
        }
        
        // If no image was generated, the model might have returned a text-only response 
        // explaining why (e.g., safety policy). The `response.text` accessor is a good fallback.
        if (!result.image && response.text) {
            result.text = response.text;
        }

        return result;
    }

    return null;
  };

export const generateVideoFromImage = async (base64ImageData: string, mimeType: string, prompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API-ключ не предоставлен.");
    }

    const ai = new GoogleGenAI({ apiKey });

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: {
          imageBytes: base64ImageData,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1
        }
    });

    // Poll for the result, as video generation is a long-running operation
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Не удалось получить ссылку для скачивания видео. Возможно, запрос был отклонен политикой безопасности.");
    }

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Ошибка при загрузке видео: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return videoUrl;
};