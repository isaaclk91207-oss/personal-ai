import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Brain,
  Settings,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  LogOut,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import type { PageView } from '../../types';

interface SidebarProps {
  activePage: PageView;
  onPageChange: (page: PageView) => void;
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    renameConversation,
    togglePin,
    searchQuery,
    setSearchQuery,
    loadConversations,
  } = useChatStore();

  const [searchVisible, setSearchVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const pinned = conversations.filter((c) => c.pinned);
  const recent = conversations.filter((c) => !c.pinned);

  const handleNewChat = async () => {
    const id = await createConversation();
    if (id) {
      setActiveConversation(id);
      onPageChange('chat');
    }
  };

  const handleRename = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setEditingId(id);
      setEditTitle(conv.title);
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const navItems = [
    { id: 'chat' as PageView, label: 'Chat', icon: MessageSquare },
    { id: 'memories' as PageView, label: 'Memories', icon: Brain },
    { id: 'settings' as PageView, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[280px] flex-shrink-0 h-screen bg-bg-sidebar border-r border-border-primary flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-primary">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow-primary">
          <Brain size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary">Personal AI</h1>
          <p className="text-[10px] text-text-muted font-medium">Assistant</p>
        </div>
      </div>

      {/* New Chat */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-all duration-200 shadow-glow-primary cursor-pointer"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 cursor-pointer mb-0.5
                ${
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }
              `}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Search */}
      <div className="px-3 py-1">
        <button
          onClick={() => setSearchVisible(!searchVisible)}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all duration-200 cursor-pointer"
        >
          <Search size={16} />
          <span>Search conversations</span>
        </button>
        {searchVisible && (
          <div className="mt-2 px-1 animate-slide-down">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-bg-input border border-border-primary rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {pinned.length > 0 && (
          <div className="mb-3">
            <p className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Pinned
            </p>
            {pinned.map((conv) => (
              <div key={conv.id} className="group relative">
                {editingId === conv.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit(conv.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(conv.id)}
                    className="w-full bg-bg-input border border-primary rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => {
                      setActiveConversation(conv.id);
                      onPageChange('chat');
                    }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                      transition-all duration-200 cursor-pointer text-left
                      ${
                        activeConversationId === conv.id
                          ? 'bg-primary-light text-primary'
                          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                      }
                    `}
                  >
                    <Pin size={12} className="flex-shrink-0 opacity-60" />
                    <span className="truncate flex-1">{conv.title}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <Tooltip content="Rename">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(conv.id);
                          }}
                          className="p-1 rounded hover:bg-bg-surface-light transition-colors cursor-pointer"
                        >
                          <Edit3 size={12} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="p-1 rounded hover:bg-bg-surface-light text-error/70 hover:text-error transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </Tooltip>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <p className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Recent
            </p>
            {recent.map((conv) => (
              <div key={conv.id} className="group relative">
                {editingId === conv.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit(conv.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(conv.id)}
                    className="w-full bg-bg-input border border-primary rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => {
                      setActiveConversation(conv.id);
                      onPageChange('chat');
                    }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                      transition-all duration-200 cursor-pointer text-left
                      ${
                        activeConversationId === conv.id
                          ? 'bg-primary-light text-primary'
                          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                      }
                    `}
                  >
                    <MessageSquare size={12} className="flex-shrink-0 opacity-60" />
                    <span className="truncate flex-1">{conv.title}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <Tooltip content="Pin">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(conv.id);
                          }}
                          className="p-1 rounded hover:bg-bg-surface-light transition-colors cursor-pointer"
                        >
                          <Pin size={12} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Rename">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(conv.id);
                          }}
                          className="p-1 rounded hover:bg-bg-surface-light transition-colors cursor-pointer"
                        >
                          <Edit3 size={12} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="p-1 rounded hover:bg-bg-surface-light text-error/70 hover:text-error transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </Tooltip>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <MessageSquare size={24} className="text-text-muted mb-2" />
            <p className="text-xs text-text-muted">No conversations yet</p>
            <p className="text-[10px] text-text-muted mt-1">Start a new chat to begin</p>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="border-t border-border-primary px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-bg-hover transition-colors cursor-pointer group">
          <Avatar name="Isaac" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">Isaac LK</p>
            <p className="text-[10px] text-text-muted truncate">isaaclk99@gmail.com</p>
          </div>
          <Tooltip content="Sign out">
            <button className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface-light transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
              <LogOut size={14} />
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
