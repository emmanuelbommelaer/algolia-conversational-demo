import axios from 'axios';
import type { FilterSuggestion } from '../types';

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'https://conversational-ai-dev.algolia.com';
const AGENT_ID = import.meta.env.VITE_AGENT_ID || '';
const APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const API_KEY = import.meta.env.VITE_ALGOLIA_API_KEY || ''; // Use the same Algolia search API key

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
    _context?: ConversationContext
  ): Promise<AgentResponse> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({ role: 'user', content: message });

      // Convert conversation history to proper OpenAPI format with parts
      const formattedMessages = this.conversationHistory.map(msg => ({
        role: msg.role,
        parts: [
          {
            type: 'text',
            text: msg.content
          }
        ]
      }));

      const payload = {
        messages: formattedMessages,
      };

      console.log('🚀 Agent API Request:', {
        url: `/1/agents/${AGENT_ID}/completions?compatibilityMode=ai-sdk-4&stream=false`,
        payload: JSON.stringify(payload, null, 2),
        headers: {
          'X-Algolia-Application-Id': APP_ID,
          'X-Algolia-API-Key': API_KEY ? `${API_KEY.substring(0, 8)}...` : 'missing',
        }
      });

      const response = await this.axiosInstance.post(
        `/1/agents/${AGENT_ID}/completions?compatibilityMode=ai-sdk-5&stream=false`,
        payload
      );

      console.log('✅ Agent API Response:', response.data);

      // Extract text from parts array in the response
      let assistantMessage = 'No response received';
      if (response.data.parts && Array.isArray(response.data.parts)) {
        const textParts = response.data.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join(' ');
        if (textParts.trim()) {
          assistantMessage = textParts.trim();
        }
      }
      
      // Add assistant response to conversation history
      this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

      return {
        message: assistantMessage,
        suggestions: this.parseSuggestions(response.data),
      };
    } catch (error: any) {
      console.error('❌ Agent API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        payload: error.config?.data
      });

      // Provide more specific error information for 422 errors
      if (error.response?.status === 422) {
        const validationDetails = error.response.data?.message || error.response.data?.error || 'Request validation failed';
        if (validationDetails.includes('not published')) {
          throw new Error(`Agent configuration error: The agent needs to be published in Algolia Agent Studio before it can be used.`);
        }
        throw new Error(`Agent API validation error (422): ${validationDetails}`);
      }

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

  /**
   * Validate agent configuration and test connectivity
   */
  async validateAgent(): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check if required environment variables are present
      if (!AGENT_API_URL || !AGENT_ID || !APP_ID || !API_KEY) {
        return {
          valid: false,
          error: `Missing configuration: ${[
            !AGENT_API_URL && 'VITE_AGENT_API_URL',
            !AGENT_ID && 'VITE_AGENT_ID', 
            !APP_ID && 'VITE_ALGOLIA_APP_ID',
            !API_KEY && 'VITE_ALGOLIA_API_KEY'
          ].filter(Boolean).join(', ')}`
        };
      }

      // Try to get agent information
      const response = await this.axiosInstance.get(`/1/agents/${AGENT_ID}`);
      console.log('✅ Agent validation successful:', response.data.name || 'Agent found');
      
      return { valid: true };
    } catch (error: any) {
      console.error('❌ Agent validation failed:', error.response?.data || error.message);
      return {
        valid: false,
        error: error.response?.status === 404 
          ? `Agent ${AGENT_ID} not found` 
          : `Agent validation error: ${error.message}`
      };
    }
  }
}

export const agentService = new AgentService();