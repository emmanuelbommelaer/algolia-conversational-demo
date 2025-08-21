import React from 'react';
import type { AgentMessage, FilterSuggestion } from '../../types';

interface MessageBubbleProps {
  message: AgentMessage;
  onApplySuggestion: (suggestion: FilterSuggestion) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onApplySuggestion,
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onApplySuggestion(suggestion)}
                className="block w-full text-left px-3 py-2 text-xs bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">
                  {suggestion.type === 'query' ? '🔍' : '🏷️'} {suggestion.label}
                </span>
              </button>
            ))}
          </div>
        )}
        
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};