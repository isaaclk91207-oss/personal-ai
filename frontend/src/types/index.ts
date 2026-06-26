export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  model?: string;
}

export interface MemoryItem {
  id: number;
  type: string;
  value: string;
  createdAt: Date;
  category?: string;
}

export type MemoryCategory = 'all' | 'fact' | 'preference' | 'context' | 'personal';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
}

export interface AppSettings {
  model: string;
  temperature: number;
  systemPrompt: string;
  memoryEnabled: boolean;
  theme: 'dark' | 'light';
  autoSaveMemories: boolean;
}

export type PageView = 'chat' | 'memories' | 'settings';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
