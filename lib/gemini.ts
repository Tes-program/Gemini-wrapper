import { GoogleGenerativeAI, GenerativeModel, Content } from '@google/generative-ai';

export const AVAILABLE_MODELS = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable model for complex tasks' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and versatile performance' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'Best for text-only tasks' },
  { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Multimodal understanding' },
];

export function initializeGemini(apiKey: string, modelName: string = 'gemini-1.5-pro') {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

export function convertToGeminiFormat(messages: Array<{ role: string; content: string }>) {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}