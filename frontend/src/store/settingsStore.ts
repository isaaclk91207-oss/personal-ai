import { create } from 'zustand';
import { api } from './api';

interface SettingsState {
  model: string;
  temperature: number;
  systemPrompt: string;
  memoryEnabled: boolean;
  theme: 'dark' | 'light';
  autoSaveMemories: boolean;
  loading: boolean;

  loadSettings: () => Promise<void>;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setSystemPrompt: (prompt: string) => void;
  setMemoryEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setAutoSaveMemories: (auto: boolean) => void;
  saveSettings: () => Promise<void>;
  resetAll: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  model: 'gpt-4',
  temperature: 0.7,
  systemPrompt: 'You are a helpful, knowledgeable AI assistant. You are conversational, concise, and thoughtful in your responses.',
  memoryEnabled: true,
  theme: 'dark' as const,
  autoSaveMemories: true,
  loading: false,

  loadSettings: async () => {
    try {
      const data = await api.getSettings();
      set({
        model: data.model,
        temperature: data.temperature,
        systemPrompt: data.systemPrompt,
        memoryEnabled: data.memoryEnabled,
        autoSaveMemories: data.autoSaveMemories,
        theme: data.theme as 'dark' | 'light',
      });
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  },

  setModel: (model) => set({ model }),
  setTemperature: (temperature) => set({ temperature }),
  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
  setMemoryEnabled: (memoryEnabled) => set({ memoryEnabled }),
  setTheme: (theme) => set({ theme }),
  setAutoSaveMemories: (autoSaveMemories) => set({ autoSaveMemories }),

  saveSettings: async () => {
    const { model, temperature, systemPrompt, memoryEnabled, autoSaveMemories, theme } = get();
    try {
      await api.updateSettings({
        model,
        temperature,
        system_prompt: systemPrompt,
        memory_enabled: memoryEnabled,
        auto_save_memories: autoSaveMemories,
        theme,
      });
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  resetAll: () => {
    set({
      model: 'gpt-4',
      temperature: 0.7,
      systemPrompt: 'You are a helpful, knowledgeable AI assistant. You are conversational, concise, and thoughtful in your responses.',
      memoryEnabled: true,
      theme: 'dark',
      autoSaveMemories: true,
    });
  },
}));
