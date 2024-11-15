export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
}

export interface Settings {
  apiKey: string;
  temperature: number;
  maxTokens: number;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  enterToSend: boolean;
  autoScroll: boolean;
  language: string;
  model: string;
}