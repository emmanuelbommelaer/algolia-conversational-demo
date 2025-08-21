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

    // Extract mentioned facets from agent message
    // This is a simplified parser - in production, the agent should return structured data
    
    // Check for city mentions
    if (facetData.cities && (agentMessage.toLowerCase().includes('city') || agentMessage.toLowerCase().includes('location'))) {
      facetData.cities.forEach((city: any, index: number) => {
        if (index < 6) {
          options.push({
            label: city.label,
            value: city.value,
            count: city.count,
            category: 'location',
            priority: city.count > 100 ? 'high' : city.count > 50 ? 'medium' : 'low',
          });
        }
      });
    }

    // Check for property type mentions
    if (facetData.propertyTypes && (agentMessage.toLowerCase().includes('property') || agentMessage.toLowerCase().includes('type'))) {
      facetData.propertyTypes.forEach((type: any, index: number) => {
        if (index < 4) {
          options.push({
            label: type.label,
            value: type.value,
            count: type.count,
            category: 'property',
            priority: type.count > 50 ? 'high' : 'medium',
          });
        }
      });
    }

    // Check for price mentions
    if (facetData.priceRange && agentMessage.toLowerCase().includes('price')) {
      const { min, max } = facetData.priceRange;
      if (min !== undefined && max !== undefined) {
        const step = (max - min) / 4;
        for (let i = 0; i < 4; i++) {
          const rangeMin = Math.round(min + step * i);
          const rangeMax = i < 3 ? Math.round(min + step * (i + 1)) : max;
          options.push({
            label: i < 3 ? `$${rangeMin} - $${rangeMax}` : `$${rangeMin}+`,
            value: `${rangeMin}:${rangeMax}`,
            count: 0,
            category: 'price',
          });
        }
      }
    }

    return options;
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