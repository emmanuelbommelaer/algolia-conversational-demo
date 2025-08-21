import React, { useState } from 'react';
import { ChatThread } from './ChatThread';
import { MessageInput } from './MessageInput';
import { AgentMessage } from '../../types';
import { useSearch } from '../../contexts/SearchContext';

export const AgentPanel: React.FC = () => {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you find products. Try asking me questions like "Show me laptops under $1000" or "I need a gaming mouse with RGB lighting".',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { searchState, updateQuery, updateFilters } = useSearch();

  const handleSendMessage = async (content: string) => {
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await simulateAgentResponse(content, searchState);
      
      const assistantMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: any) => {
    if (suggestion.type === 'query') {
      updateQuery(suggestion.value);
    } else if (suggestion.type === 'filter') {
      updateFilters({ [suggestion.field]: suggestion.value });
    }
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        <p className="text-sm text-gray-600">Ask me about products</p>
      </div>
      
      <ChatThread
        messages={messages}
        isLoading={isLoading}
        onApplySuggestion={handleApplySuggestion}
      />
      
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

async function simulateAgentResponse(message: string, searchState: any) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const lowerMessage = message.toLowerCase();
  const suggestions = [];
  
  if (lowerMessage.includes('laptop')) {
    suggestions.push({
      type: 'filter',
      label: 'Category: Laptops',
      value: 'Laptops',
      field: 'category',
    });
  }
  
  if (lowerMessage.includes('under') && lowerMessage.match(/\$?\d+/)) {
    const priceMatch = lowerMessage.match(/\$?(\d+)/);
    if (priceMatch) {
      suggestions.push({
        type: 'filter',
        label: `Max Price: $${priceMatch[1]}`,
        value: parseInt(priceMatch[1]),
        field: 'price_max',
      });
    }
  }
  
  if (lowerMessage.includes('gaming')) {
    suggestions.push({
      type: 'query',
      label: 'Search: gaming',
      value: 'gaming',
    });
  }
  
  return {
    message: `I understand you're looking for "${message}". ${
      suggestions.length > 0
        ? "I've found some filters that might help. Click on them to apply:"
        : 'Try being more specific about what you need.'
    }`,
    suggestions,
  };
}