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
        agentService.resetSession();
        this.sessionStarted = true;
      }

      // Build context message about current search state
      let contextMessage = 'Current search state: ';
      
      if (Object.keys(currentFilters).length === 0) {
        contextMessage += 'No filters applied. User is starting their search for an Airbnb listing.';
      } else {
        contextMessage += `Filters applied: ${JSON.stringify(currentFilters)}. `;
        contextMessage += `Found ${resultCount} results.`;
      }

      // Add available facets information
      if (facetData) {
        contextMessage += ` Available facets: ${JSON.stringify(facetData)}`;
      }

      // Request guidance from the agent
      contextMessage += ' Please provide: 1) A helpful message guiding the user on what to select next, and 2) The most relevant facet options they should consider.';

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
      
      // Fallback to basic guidance if agent fails
      return this.getFallbackGuidance(currentFilters, resultCount, facetData);
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

  private getFallbackGuidance(
    currentFilters: Record<string, any>,
    resultCount: number,
    facetData: any
  ): GuidedSearchResponse {
    let message = '';
    let options: FacetOption[] = [];
    const stage = this.determineNextStage(currentFilters);

    switch (stage) {
      case 'location':
        message = "Welcome! I'll help you find the perfect Airbnb. Let's start by choosing a location. Where would you like to stay?";
        if (facetData?.cities) {
          options = facetData.cities.slice(0, 6).map((city: any) => ({
            label: city.label,
            value: city.value,
            count: city.count,
            category: 'location' as const,
            priority: city.count > 100 ? 'high' as const : city.count > 50 ? 'medium' as const : 'low' as const,
          }));
        }
        break;

      case 'property_type':
        message = `Great choice! Now let's find the right type of place for your stay. What kind of property interests you?`;
        if (facetData?.propertyTypes) {
          options = facetData.propertyTypes.slice(0, 4).map((type: any) => ({
            label: type.label,
            value: type.value,
            count: type.count,
            category: 'property' as const,
            priority: type.count > 50 ? 'high' as const : 'medium' as const,
          }));
        }
        break;

      case 'price':
        message = `Perfect! I found ${resultCount.toLocaleString()} properties. Let's narrow this down by price range to find options that fit your budget.`;
        if (facetData?.priceRange) {
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
                category: 'price' as const,
              });
            }
          }
        }
        break;

      default:
        if (resultCount > 20) {
          message = `You have ${resultCount.toLocaleString()} great options! Let me suggest some ways to narrow down your search further.`;
        } else if (resultCount > 0) {
          message = `Perfect! You've found ${resultCount.toLocaleString()} great ${resultCount === 1 ? 'property' : 'properties'} that match your preferences.`;
        } else {
          message = "No properties match your current criteria. Try adjusting your filters to find great options.";
        }
    }

    return { message, facetOptions: options, nextStage: stage };
  }

  resetSession() {
    this.sessionStarted = false;
    agentService.resetSession();
  }
}

export const guidedSearchAgent = new GuidedSearchAgent();