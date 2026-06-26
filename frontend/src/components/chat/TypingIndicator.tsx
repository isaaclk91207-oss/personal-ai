import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow-primary flex-shrink-0 mt-1">
        <Bot size={16} className="text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-text-muted mb-2 px-1">Assistant</span>
        <div className="bg-bg-surface border border-border-primary rounded-2xl rounded-tl-md px-5 py-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full bg-primary animate-typing"
              style={{ animationDelay: '0s' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-primary animate-typing"
              style={{ animationDelay: '0.2s' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-primary animate-typing"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
