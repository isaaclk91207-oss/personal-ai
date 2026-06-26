import { useState } from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar } from '../ui/Avatar';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-border-primary bg-bg-primary">
      <div className="flex items-center justify-between px-4 py-2 bg-bg-surface-light border-b border-border-primary">
        <span className="text-xs font-medium text-text-muted">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-success" />
              <span className="text-success">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="px-4 py-3 text-sm leading-relaxed">
          <code className="font-mono text-text-primary">{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp);

  return (
    <div
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in group ${
        isStreaming ? 'streaming' : ''
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <Avatar name="You" size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow-primary">
            <Bot size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name */}
        <span className="text-xs font-medium text-text-muted mb-1.5 px-1">
          {isUser ? 'You' : 'Assistant'}
        </span>

        {/* Bubble */}
        <div
          className={`
            rounded-2xl px-4 py-3
            ${
              isUser
                ? 'bg-primary text-white rounded-tr-md'
                : 'bg-bg-surface border border-border-primary rounded-tl-md'
            }
          `}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const code = String(children).replace(/\n$/, '');
                    if (match) {
                      return <CodeBlock language={match[1]} code={code} />;
                    }
                    return (
                      <code className="bg-bg-surface-light text-primary px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-text-muted mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
