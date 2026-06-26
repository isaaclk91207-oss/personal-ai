import { Wifi, WifiOff, Brain, Cpu } from 'lucide-react';

interface ChatHeaderProps {
  modelName: string;
  isConnected: boolean;
  memoryCount: number;
}

export function ChatHeader({ modelName, isConnected, memoryCount }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border-primary bg-bg-primary/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow-primary">
          <Cpu size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{modelName}</h2>
          <p className="text-[10px] text-text-muted">AI Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface-light border border-border-primary">
          {isConnected ? (
            <Wifi size={14} className="text-success" />
          ) : (
            <WifiOff size={14} className="text-error" />
          )}
          <span className={`text-xs font-medium ${isConnected ? 'text-success' : 'text-error'}`}>
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Memory Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface-light border border-border-primary">
          <Brain size={14} className="text-primary" />
          <span className="text-xs font-medium text-text-secondary">
            {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}
          </span>
        </div>
      </div>
    </div>
  );
}
