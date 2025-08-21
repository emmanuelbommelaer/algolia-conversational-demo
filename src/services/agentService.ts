import axios from 'axios';
import type { FilterSuggestion } from '../types';

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'https://conversational-ai-dev.algolia.com';
const AGENT_ID = import.meta.env.VITE_AGENT_ID || '';
const APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const API_KEY = import.meta.env.VITE_AGENT_API_KEY || '';

interface AgentResponse {
  message: string;
  suggestions?: FilterSuggestion[];
}

interface ConversationContext {
  currentQuery?: string;
  appliedFilters?: Record<string, any>;
  resultCount?: number;
}

export class AgentService {
  private conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [];
  private axiosInstance = axios.create({
    baseURL: AGENT_API_URL,
    headers: {
      'X-Algolia-Application-Id': APP_ID,
      'X-Algolia-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  async sendMessage(
    message: string,
    context?: ConversationContext
  ): Promise<AgentResponse> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({ role: 'user', content: message });

      const payload = {
        messages: this.conversationHistory,
        configuration: context ? {
          searchParameters: {
            query: context.currentQuery || '',
            filters: context.appliedFilters || {},
          },
          resultCount: context.resultCount || 0,
        } : undefined,
      };

      const response = await this.axiosInstance.post(
        `/1/agents/${AGENT_ID}/completions?compatibilityMode=ai-sdk-4&stream=false`,
        payload
      );

      const assistantMessage = response.data.content || response.data.message || 'No response received';
      
      // Add assistant response to conversation history
      this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

      return {
        message: assistantMessage,
        suggestions: this.parseSuggestions(response.data),
      };
    } catch (error) {
      console.error('Agent API error:', error);
      throw new Error(`Failed to communicate with the agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseSuggestions(response: any): FilterSuggestion[] {
    const suggestions: FilterSuggestion[] = [];
    
    if (response.filters) {
      Object.entries(response.filters).forEach(([field, value]) => {
        suggestions.push({
          type: 'filter',
          label: `${field}: ${value}`,
          value: value as string | number | boolean,
          field,
        });
      });
    }

    if (response.query_suggestion) {
      suggestions.push({
        type: 'query',
        label: response.query_suggestion,
        value: response.query_suggestion,
      });
    }

    return suggestions;
  }

  resetSession() {
    this.conversationHistory = [];
  }
}

export const agentService = new AgentService();