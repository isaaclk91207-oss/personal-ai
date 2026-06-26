import { create } from 'zustand';
import { api } from './api';
import { useToastStore } from './toastStore';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  searchQuery: string;
  loading: boolean;

  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  createConversation: () => Promise<string>;
  setActiveConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  setStreaming: (streaming: boolean) => void;
  setSearchQuery: (query: string) => void;
  getFilteredConversations: () => Conversation[];
  clearAll: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
  searchQuery: '',
  loading: false,

  loadConversations: async () => {
    try {
      const data = await api.getConversations();
      set({
        conversations: data.map((c: any) => ({
          ...c,
          messages: [],
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        })),
      });
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
  },

  loadConversation: async (id: string) => {
    try {
      const data = await api.getConversation(id);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id
            ? {
                ...c,
                title: data.title,
                pinned: data.pinned,
                messages: data.messages.map((m: any) => ({
                  ...m,
                  timestamp: new Date(m.timestamp),
                })),
              }
            : c
        ),
      }));
    } catch (e) {
      console.error('Failed to load conversation', e);
    }
  },

  createConversation: async () => {
    try {
      const data = await api.createConversation();
      const newConv: Conversation = {
        id: data.id,
        title: data.title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        pinned: false,
      };
      set((state) => ({
        conversations: [newConv, ...state.conversations],
        activeConversationId: data.id,
      }));
      return data.id;
    } catch (e) {
      console.error('Failed to create conversation', e);
      return '';
    }
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
    const conv = get().conversations.find((c) => c.id === id);
    if (conv && conv.messages.length === 0) {
      get().loadConversation(id);
    }
  },

  sendMessage: async (content) => {
    const { activeConversationId, conversations } = get();
    let convId = activeConversationId;

    if (!convId) {
      convId = await get().createConversation();
      if (!convId) return;
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              updatedAt: new Date(),
              title:
                c.messages.length === 0
                  ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
                  : c.title,
            }
          : c
      ),
      isStreaming: true,
    }));

    try {
      const data = await api.chat(content, convId);

      // Stream the response character by character
      const assistantId = Math.random().toString(36).substring(2, 15);
      let streamedContent = '';
      const chars = data.reply.split('');

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { id: assistantId, content: '', role: 'assistant', timestamp: new Date() },
                ],
              }
            : c
        ),
      }));

      let idx = 0;
      const interval = setInterval(() => {
        if (idx < chars.length) {
          streamedContent += chars[idx];
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m, i) =>
                      i === c.messages.length - 1 ? { ...m, content: streamedContent } : m
                    ),
                  }
                : c
            ),
          }));
          idx++;
        } else {
          clearInterval(interval);
          set({ isStreaming: false });
          get().loadConversations();
        }
      }, 15);

      if (data.memory_updated) {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Memory Updated',
          message: 'I learned something new about you',
        });
      }
    } catch (e) {
      console.error('Failed to send message', e);
      set({ isStreaming: false });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to send message',
        message: 'Check your connection and try again',
      });
    }
  },

  deleteConversation: async (id) => {
    try {
      await api.deleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        activeConversationId:
          state.activeConversationId === id ? null : state.activeConversationId,
      }));
    } catch (e) {
      console.error('Failed to delete conversation', e);
    }
  },

  renameConversation: async (id, title) => {
    try {
      await api.updateConversation(id, { title });
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title } : c
        ),
      }));
    } catch (e) {
      console.error('Failed to rename conversation', e);
    }
  },

  togglePin: async (id) => {
    const conv = get().conversations.find((c) => c.id === id);
    if (!conv) return;
    try {
      await api.updateConversation(id, { pinned: !conv.pinned });
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, pinned: !c.pinned } : c
        ),
      }));
    } catch (e) {
      console.error('Failed to toggle pin', e);
    }
  },

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredConversations: () => {
    const { conversations, searchQuery } = get();
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  },

  clearAll: async () => {
    try {
      await api.clearConversations();
      set({ conversations: [], activeConversationId: null });
    } catch (e) {
      console.error('Failed to clear conversations', e);
    }
  },
}));
