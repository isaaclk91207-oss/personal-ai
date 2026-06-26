import { Brain } from 'lucide-react';

export function EmptyMemory() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary-light border border-primary/20 flex items-center justify-center mb-5">
        <Brain size={32} className="text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">No memories yet</h3>
      <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
        Memories allow me to remember details about you and our conversations. Start chatting and I'll begin building your memory profile.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        <span className="px-3 py-1.5 text-xs text-text-muted bg-bg-surface-light border border-border-primary rounded-lg">
          Your preferences
        </span>
        <span className="px-3 py-1.5 text-xs text-text-muted bg-bg-surface-light border border-border-primary rounded-lg">
          Key facts
        </span>
        <span className="px-3 py-1.5 text-xs text-text-muted bg-bg-surface-light border border-border-primary rounded-lg">
          Personal context
        </span>
      </div>
    </div>
  );
}
