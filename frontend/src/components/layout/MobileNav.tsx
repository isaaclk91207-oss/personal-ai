import { MessageSquare, Brain, Settings, Plus } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import type { PageView } from '../../types';

interface MobileNavProps {
  activePage: PageView;
  onPageChange: (page: PageView) => void;
  onToggleSidebar: () => void;
}

export function MobileNav({ activePage, onPageChange, onToggleSidebar }: MobileNavProps) {
  const { createConversation } = useChatStore();

  const navItems = [
    { id: 'chat' as PageView, label: 'Chat', icon: MessageSquare },
    { id: 'memories' as PageView, label: 'Memories', icon: Brain },
    { id: 'settings' as PageView, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-bg-sidebar/95 backdrop-blur-md border-b border-border-primary">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <MessageSquare size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Brain size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary">Personal AI</span>
        </div>
        <button
          onClick={async () => {
            await createConversation();
            onPageChange('chat');
          }}
          className="p-2 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 bg-bg-sidebar/95 backdrop-blur-md border-t border-border-primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors cursor-pointer
                ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}
              `}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
