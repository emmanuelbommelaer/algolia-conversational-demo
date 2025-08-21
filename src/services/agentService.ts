import axios from 'axios';
import { AgentMessage, FilterSuggestion } from '../types';

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'https://conversational-ai-dev.algolia.com';
const AGENT_ID = import.meta.env.VITE_AGENT_ID || '';
const API_KEY = import.meta.env.VITE_AGENT_API_KEY || '';

interface AgentResponse {
  message: string;
  suggestions?: FilterSuggestion[];
  sessionId?: string;
}

interface ConversationContext {
  currentQuery?: string;
  appliedFilters?: Record<string, any>;
  resultCount?: number;
}

export class AgentService {
  private sessionId: string | null = null;
  private axiosInstance = axios.create({
    baseURL: AGENT_API_URL,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  async sendMessage(
    message: string,
    context?: ConversationContext
  ): Promise<AgentResponse> {
    try {
      const payload = {
        message,
        sessionId: this.sessionId,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
        },
      };

      const response = await this.axiosInstance.post(
        `/agents/${AGENT_ID}/chat`,
        payload
      );

      if (response.data.sessionId) {
        this.sessionId = response.data.sessionId;
      }

      return {
        message: response.data.message || response.data.response,
        suggestions: this.parseSuggestions(response.data),
        sessionId: response.data.sessionId,
      };
    } catch (error) {
      console.error('Agent API error:', error);
      throw new Error('Failed to communicate with the agent');
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
    this.sessionId = null;
  }
}

export const agentService = new AgentService();