/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/gemini.ts - Updated version with search grounding
import { 
  GoogleGenerativeAI, 
  GenerativeModel, 
  Content,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIResponseError
} from '@google/generative-ai';

export const AVAILABLE_MODELS = [
  { 
    id: 'gemini-1.5-pro', 
    name: 'Gemini 1.5 Pro', 
    description: 'Most capable model for complex tasks',
    supportsGrounding: true 
  },
  { 
    id: 'gemini-1.5-flash', 
    name: 'Gemini 1.5 Flash', 
    description: 'Fast and versatile performance',
    supportsGrounding: true 
  },
  { 
    id: 'gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    description: 'Best for fast responses',
    supportsGrounding: true
  },
  { 
    id: 'gemini-2.5-pro', 
    name: 'Gemini 2.5 Pro', 
    description: 'Best for complex challenges',
    supportsGrounding: true
  },
];

export interface SearchGroundingConfig {
  enabled: boolean;
  threshold?: number; // Confidence threshold for using search results
}

export function initializeGemini(
  apiKey: string, 
  modelName: string = 'gemini-1.5-pro',
  searchGrounding?: SearchGroundingConfig
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelConfig: any = {
    model: modelName,
  };

  // Add grounding configuration if supported and enabled
  if (searchGrounding?.enabled) {
    modelConfig.tools = [{
      googleSearchRetrieval: {
        dynamicRetrievalConfig: {
          mode: "MODE_DYNAMIC",
          dynamicThreshold: searchGrounding.threshold || 0.7
        }
      }
    }];
  }

  return genAI.getGenerativeModel(modelConfig);
}

export function convertToGeminiFormat(messages: Array<{ role: string; content: string }>) {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}