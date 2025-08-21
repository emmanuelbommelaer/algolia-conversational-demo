export interface Product {
  objectID: string;
  name: string;
  description?: string;
  price: number;
  // Image fields from Algolia Airbnb dataset
  image?: string;
  picture_url?: string;
  xl_picture_url?: string;
  medium_url?: string;
  thumbnail_url?: string;
  // Category/classification fields
  category?: string;
  room_type?: string;
  property_type?: string;
  room_type_category?: string;
  // Location fields
  city?: string;
  neighborhood?: string;
  address?: string;
  // Additional fields
  brand?: string;
  rating?: number;
  features?: string[];
  reviews_count?: number;
  person_capacity?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
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

export type FilterValue = string | string[] | number | boolean;

export interface SearchState {
  query: string;
  filters: Record<string, FilterValue>;
  page: number;
}

export interface FacetOption {
  label: string;
  value: string;
  count: number;
  category: 'location' | 'property' | 'price' | 'amenities';
  priority?: 'high' | 'medium' | 'low';
}

export interface SearchFlowState {
  stage: 'welcome' | 'location' | 'property_type' | 'price' | 'amenities' | 'refine';
  resultCount: number;
  suggestedOptions: FacetOption[];
  agentMessage: string;
  completedStages: string[];
}