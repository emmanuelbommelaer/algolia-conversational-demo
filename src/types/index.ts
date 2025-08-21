export interface Product {
  objectID: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
  rating?: number;
  features?: string[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: FilterSuggestion[];
}

export interface FilterSuggestion {
  type: 'filter' | 'query' | 'refinement';
  label: string;
  value: string | number | boolean;
  field?: string;
}

export interface SearchState {
  query: string;
  filters: Record<string, any>;
  page: number;
}