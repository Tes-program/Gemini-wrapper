// app/types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  systemInstruction?: string;
}
