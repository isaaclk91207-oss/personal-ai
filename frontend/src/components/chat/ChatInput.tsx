import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Paperclip, Mic, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStopStreaming?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStopStreaming,
  disabled = false,
  isStreaming = false,
  placeholder = 'Ask me anything...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, disabled, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="border-t border-border-primary bg-bg-primary/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="relative flex items-end gap-2 bg-bg-surface border border-border-primary rounded-2xl transition-all duration-200 focus-within:border-primary focus-within:shadow-glow-primary">
          {/* Attachment Button */}
          <button
            disabled={disabled}
            className="flex-shrink-0 p-3 pl-4 text-text-muted hover:text-text-primary transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Paperclip size={18} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted py-3 resize-none outline-none max-h-[200px] disabled:opacity-50"
          />

          {/* Voice Button */}
          <button
            disabled={disabled}
            className="flex-shrink-0 p-3 text-text-muted hover:text-text-primary transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Mic size={18} />
          </button>

          {/* Send / Stop Button */}
          {isStreaming ? (
            <button
              onClick={onStopStreaming}
              className="flex-shrink-0 p-3 pr-4 text-error hover:text-error/80 transition-colors cursor-pointer"
              title="Stop generating"
            >
              <Square size={18} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`
                flex-shrink-0 p-3 pr-4 transition-all duration-200 cursor-pointer
                ${
                  input.trim()
                    ? 'text-primary hover:text-primary-hover'
                    : 'text-text-muted cursor-not-allowed'
                }
              `}
            >
              <Send size={18} />
            </button>
          )}
        </div>

        {/* Hint */}
        <p className="text-[10px] text-text-muted text-center mt-2">
          AI responses may not always be accurate. Press <kbd className="px-1 py-0.5 rounded bg-bg-surface-light border border-border-primary text-text-muted font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-bg-surface-light border border-border-primary text-text-muted font-mono text-[9px]">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
