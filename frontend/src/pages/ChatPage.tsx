import { useEffect, useRef } from 'react';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { EmptyChat } from '../components/chat/EmptyChat';
import { useChatStore } from '../store/chatStore';
import { useMemoryStore } from '../store/memoryStore';

export function ChatPage() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    sendMessage,
    isStreaming,
    loadConversations,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isStreaming]);

  const handleNewChat = async () => {
    const id = await createConversation();
    if (id) {
      setActiveConversation(id);
    }
  };

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ChatHeader
        modelName="GPT-4"
        isConnected={true}
        memoryCount={useMemoryStore.getState().memories.length}
      />

      <div className="flex-1 overflow-y-auto">
        {!activeConversation || activeConversation.messages.length === 0 ? (
          <EmptyChat onStartChat={handleNewChat} />
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {activeConversation.messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={
                  isStreaming &&
                  idx === activeConversation.messages.length - 1 &&
                  msg.role === 'assistant'
                }
              />
            ))}
            {isStreaming &&
              activeConversation.messages[activeConversation.messages.length - 1]
                ?.content === '' && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        disabled={false}
      />
    </div>
  );
}
