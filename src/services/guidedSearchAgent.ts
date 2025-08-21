import { agentService } from './agentService';
import type { FacetOption } from '../types';

interface GuidedSearchResponse {
  message: string;
  facetOptions: FacetOption[];
  nextStage?: string;
}

export class GuidedSearchAgent {
  private sessionStarted = false;

  async getGuidance(
    currentFilters: Record<string, any>,
    resultCount: number,
    facetData?: any
  ): Promise<GuidedSearchResponse> {
    try {
      // Initialize session with welcome prompt if not started
      if (!this.sessionStarted) {
        // Validate agent configuration first
        const validation = await agentService.validateAgent();
        if (!validation.valid) {
          throw new Error(`Agent configuration invalid: ${validation.error}`);
        }
        
        agentService.resetSession();
        this.sessionStarted = true;
      }

      // Build concise context message for the agent
      let contextMessage = `Search status: ${resultCount} properties found.`;
      
      if (Object.keys(currentFilters).length === 0) {
        contextMessage += ' No filters applied yet.';
      } else {
        contextMessage += ` Applied filters: ${JSON.stringify(currentFilters)}.`;
      }

      // Add available facets information for agent to choose from
      if (facetData) {
        contextMessage += ` Available filter options: ${JSON.stringify(facetData)}.`;
      }

      // Request concise response with single filter choice
      contextMessage += ' Provide a brief 1-2 sentence message and exactly ONE filter choice in the specified JSON format.';

      const response = await agentService.sendMessage(contextMessage, {
        appliedFilters: currentFilters,
        resultCount,
      });

      // Parse the agent's response to extract facet options
      const facetOptions = this.parseAgentResponseForFacets(response.message, facetData);

      return {
        message: response.message,
        facetOptions,
        nextStage: this.determineNextStage(currentFilters),
      };
    } catch (error) {
      console.error('Guided search agent error:', error);
      
      // Re-throw the error to make the app visibly fail
      throw new Error(`Agent service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAgentResponseForFacets(agentMessage: string, facetData: any): FacetOption[] {
    const options: FacetOption[] = [];
    
    if (!facetData) return options;

    try {
      // Extract JSON from agent message
      const jsonMatch = agentMessage.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                       agentMessage.match(/(\{[^}]*"filter_choice"[^}]*\})/);
      
      if (!jsonMatch) {
        console.warn('No JSON found in agent response, trying fallback parsing');
        return this.fallbackParseOptions(agentMessage, facetData);
      }

      const jsonData = JSON.parse(jsonMatch[1]);
      
      if (!jsonData.filter_choice) {
        console.warn('No filter_choice found in agent JSON');
        return this.fallbackParseOptions(agentMessage, facetData);
      }

      const filterChoice = jsonData.filter_choice;
      const category = filterChoice.category;
      const choiceOptions = filterChoice.options || [];

      // Convert agent's choices to FacetOption format
      choiceOptions.forEach((option: any) => {
        options.push({
          label: option.label,
          value: option.value,
          count: option.count || 0,
          category: this.mapCategoryToInternal(category) as 'location' | 'property' | 'price' | 'amenities',
          priority: option.count > 100 ? 'high' : option.count > 50 ? 'medium' : 'low',
        });
      });

      // Limit to single choice as per requirements
      return options.slice(0, 1);

    } catch (error) {
      console.error('Error parsing agent JSON response:', error);
      return this.fallbackParseOptions(agentMessage, facetData);
    }
  }

  private mapCategoryToInternal(agentCategory: string): string {
    switch (agentCategory) {
      case 'location': return 'location';
      case 'property': return 'property';
      case 'price': return 'price';
      case 'amenities': return 'amenities';
      default: return 'property';
    }
  }

  private fallbackParseOptions(_agentMessage: string, facetData: any): FacetOption[] {
    // Fallback to single option from most relevant category
    const options: FacetOption[] = [];

    if (facetData.cities && facetData.cities.length > 0) {
      options.push({
        label: facetData.cities[0].label,
        value: facetData.cities[0].value,
        count: facetData.cities[0].count,
        category: 'location',
        priority: 'high',
      });
    } else if (facetData.propertyTypes && facetData.propertyTypes.length > 0) {
      options.push({
        label: facetData.propertyTypes[0].label,
        value: facetData.propertyTypes[0].value,
        count: facetData.propertyTypes[0].count,
        category: 'property',
        priority: 'high',
      });
    }

    return options.slice(0, 1); // Always return only one option
  }

  private determineNextStage(currentFilters: Record<string, any>): string {
    const hasLocation = currentFilters.city || currentFilters.neighborhood;
    const hasPropertyType = currentFilters.property_type || currentFilters.room_type;
    const hasPrice = currentFilters.price;

    if (!hasLocation && !hasPropertyType) return 'location';
    if (!hasPropertyType) return 'property_type';
    if (!hasPrice) return 'price';
    return 'refine';
  }


  resetSession() {
    this.sessionStarted = false;
    agentService.resetSession();
  }
}

export const guidedSearchAgent = new GuidedSearchAgent();