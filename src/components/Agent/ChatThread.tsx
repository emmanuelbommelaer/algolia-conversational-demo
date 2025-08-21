import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { AgentMessage, FilterSuggestion } from '../../types';

interface ChatThreadProps {
  messages: AgentMessage[];
  isLoading: boolean;
  onApplySuggestion: (suggestion: FilterSuggestion) => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  isLoading,
  onApplySuggestion,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onApplySuggestion={onApplySuggestion}
        />
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};