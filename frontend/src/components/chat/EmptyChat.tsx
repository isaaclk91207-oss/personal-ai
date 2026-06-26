import { Sparkles, Zap, Shield, Brain } from 'lucide-react';

interface EmptyChatProps {
  onStartChat: () => void;
}

const features = [
  { icon: Brain, title: 'Long-term Memory', description: 'I remember our conversations and learn from them' },
  { icon: Zap, title: 'Instant Responses', description: 'Fast, context-aware answers to your questions' },
  { icon: Shield, title: 'Private & Secure', description: 'Your data stays yours, always encrypted' },
  { icon: Sparkles, title: 'Smart Assistance', description: 'Code, write, analyze, and more' },
];

export function EmptyChat({ onStartChat }: EmptyChatProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* Illustration */}
        <div className="relative inline-flex mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow-primary">
            <Sparkles size={36} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-success/20 border border-success/30 flex items-center justify-center">
            <Brain size={16} className="text-success" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Welcome to Personal AI
        </h1>
        <p className="text-base text-text-secondary mb-10 max-w-lg mx-auto leading-relaxed">
          Your intelligent assistant with long-term memory. Start a conversation and I'll learn from every interaction.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-4 rounded-2xl bg-bg-surface border border-border-primary hover:border-border-hover transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-0.5">{feature.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={onStartChat}
          className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-all duration-200 shadow-glow-primary cursor-pointer"
        >
          <Sparkles size={18} />
          Start a conversation
        </button>

        {/* Examples */}
        <div className="mt-8">
          <p className="text-xs text-text-muted mb-3">Try asking me things like</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Explain quantum computing', 'Write a React component', 'Help me plan my day', 'What do you know about me?'].map(
              (example) => (
                <button
                  key={example}
                  onClick={() => onStartChat()}
                  className="px-3 py-1.5 text-xs text-text-secondary bg-bg-surface-light border border-border-primary rounded-lg hover:border-border-hover hover:text-text-primary transition-all duration-200 cursor-pointer"
                >
                  {example}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
