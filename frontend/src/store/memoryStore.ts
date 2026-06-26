import { create } from 'zustand';
import { api } from './api';

interface Memory {
  id: number;
  type: string;
  value: string;
  createdAt: Date;
  category: string;
}

interface MemoryState {
  memories: Memory[];
  searchQuery: string;
  activeCategory: string;
  isEditModalOpen: boolean;
  editingMemory: Memory | null;
  loading: boolean;

  loadMemories: () => Promise<void>;
  addMemory: (memory: { type: string; value: string; category: string }) => void;
  updateMemory: (id: number, updates: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string) => void;
  openEditModal: (memory: Memory) => void;
  closeEditModal: () => void;
  getFilteredMemories: () => Memory[];
  clearAll: () => Promise<void>;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  searchQuery: '',
  activeCategory: 'all',
  isEditModalOpen: false,
  editingMemory: null,
  loading: false,

  loadMemories: async () => {
    try {
      set({ loading: true });
      const data = await api.getMemories();
      set({
        memories: data.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })),
        loading: false,
      });
    } catch (e) {
      console.error('Failed to load memories', e);
      set({ loading: false });
    }
  },

  addMemory: (memory) => {
    // Optimistic add; backend also saves via chat
    set((state) => ({
      memories: [
        { ...memory, id: Date.now(), createdAt: new Date() },
        ...state.memories,
      ],
    }));
  },

  updateMemory: async (id, updates) => {
    try {
      await api.updateMemory(id, {
        type: updates.type,
        value: updates.value,
        category: updates.category,
      });
      set((state) => ({
        memories: state.memories.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      }));
    } catch (e) {
      console.error('Failed to update memory', e);
    }
  },

  deleteMemory: async (id) => {
    try {
      await api.deleteMemory(id);
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== id),
      }));
    } catch (e) {
      console.error('Failed to delete memory', e);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),

  openEditModal: (memory) => set({ isEditModalOpen: true, editingMemory: memory }),
  closeEditModal: () => set({ isEditModalOpen: false, editingMemory: null }),

  getFilteredMemories: () => {
    const { memories, searchQuery, activeCategory } = get();
    let filtered = memories;
    if (activeCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.type.toLowerCase().includes(q) ||
          m.value.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  clearAll: async () => {
    try {
      await api.clearMemories();
      set({ memories: [] });
    } catch (e) {
      console.error('Failed to clear memories', e);
    }
  },
}));
