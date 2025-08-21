import React, { useState, useEffect } from 'react';
import { ChatThread } from './ChatThread';
import { MessageInput } from './MessageInput';
import type { AgentMessage } from '../../types';
import { useSearch } from '../../contexts/SearchContext';
import { agentService } from '../../services/agentService';

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
  const [resultCount, setResultCount] = useState(0);
  const { searchState, updateQuery, addFilter } = useSearch();

  // Update result count when available (this will be set by the search panel)
  useEffect(() => {
    // This is a placeholder - in a real implementation, you'd get this from the search state
    // For now, we'll pass 0 and let the agent work without result count context
    setResultCount(0);
  }, [searchState]);

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
      const response = await agentService.sendMessage(content, {
        currentQuery: searchState.query,
        appliedFilters: searchState.filters,
        resultCount,
      });
      
      const assistantMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Agent service error:', error);
      const errorMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your agent configuration.`,
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
    } else if (suggestion.type === 'filter' && suggestion.field) {
      addFilter(suggestion.field, suggestion.value);
    }
  };

  return (
    <div className="w-full lg:w-96 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-96 lg:h-auto">
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

