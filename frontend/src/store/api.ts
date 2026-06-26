const BASE_URL = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  // Chat
  chat: (message: string, conversationId?: string) =>
    request<{ reply: string; conversation_id: string; memory_updated: boolean; memory_type?: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    }),

  // Conversations
  getConversations: (search?: string) =>
    request<Array<{ id: string; title: string; createdAt: string; updatedAt: string; pinned: boolean }>>(
      `/api/conversations${search ? `?search=${encodeURIComponent(search)}` : ''}`
    ),

  getConversation: (id: string) =>
    request<{ id: string; title: string; messages: Array<{ id: string; role: string; content: string; timestamp: string }> }>(
      `/api/conversations/${id}`
    ),

  createConversation: (title?: string) =>
    request<{ id: string; title: string }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New conversation' }),
    }),

  updateConversation: (id: string, data: { title?: string; pinned?: boolean }) =>
    request<{ ok: boolean }>(`/api/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteConversation: (id: string) =>
    request<{ ok: boolean }>(`/api/conversations/${id}`, { method: 'DELETE' }),

  clearConversations: () =>
    request<{ ok: boolean }>('/api/conversations', { method: 'DELETE' }),

  // Memories
  getMemories: (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category && category !== 'all') params.set('category', category);
    const qs = params.toString();
    return request<Array<{ id: number; type: string; value: string; category: string; createdAt: string }>>(
      `/api/memories${qs ? `?${qs}` : ''}`
    );
  },

  updateMemory: (id: number, data: { type?: string; value?: string; category?: string }) =>
    request<{ ok: boolean }>(`/api/memories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMemory: (id: number) =>
    request<{ ok: boolean }>(`/api/memories/${id}`, { method: 'DELETE' }),

  clearMemories: () =>
    request<{ ok: boolean }>('/api/memories', { method: 'DELETE' }),

  // Settings
  getSettings: () =>
    request<{
      model: string;
      temperature: number;
      systemPrompt: string;
      memoryEnabled: boolean;
      autoSaveMemories: boolean;
      theme: string;
    }>('/api/settings'),

  updateSettings: (data: {
    model?: string;
    temperature?: number;
    system_prompt?: string;
    memory_enabled?: boolean;
    auto_save_memories?: boolean;
    theme?: string;
  }) =>
    request<{ ok: boolean }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
