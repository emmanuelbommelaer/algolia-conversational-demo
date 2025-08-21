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
      // Extract JSON from agent message - try multiple patterns
      const jsonMatch = agentMessage.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                       agentMessage.match(/(\{[^}]*"text"[^}]*"filters"[^}]*\})/g) ||
                       agentMessage.match(/(\{[^}]*"filters"[^}]*"text"[^}]*\})/g) ||
                       agentMessage.match(/(\{[^}]*"filter_choice"[^}]*\})/g) ||
                       agentMessage.match(/(\{[^}]*"filterOptions"[^}]*\})/g) ||
                       agentMessage.match(/(\{[^}]*"cities"[^}]*\})/g) ||
                       agentMessage.match(/(\{[\s\S]*?\})/g);
      
      if (!jsonMatch) {
        console.warn('No JSON found in agent response, trying fallback parsing');
        return this.fallbackParseOptions(agentMessage, facetData);
      }

      const jsonData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      console.log('Parsed agent JSON:', jsonData);
      
      // Handle the new format with 'text' and 'filters' keys
      if (jsonData.text && jsonData.filters) {
        const filters = jsonData.filters;
        
        // If filters is null, it means perfect results - no filter needed
        if (filters === null) {
          console.log('Agent says perfect results - no filter needed');
          return [];
        }
        
        const category = filters.category;
        const choiceOptions = filters.options || [];

        choiceOptions.forEach((option: any) => {
          options.push({
            label: option.label,
            value: option.value,
            count: option.count || 0,
            category: this.mapCategoryToInternal(category) as 'location' | 'property' | 'price' | 'amenities',
            priority: option.count > 100 ? 'high' : option.count > 50 ? 'medium' : 'low',
          });
        });
      }
      // Handle the legacy filter_choice format for backward compatibility
      else if (jsonData.filter_choice) {
        const filterChoice = jsonData.filter_choice;
        const category = filterChoice.category;
        const choiceOptions = filterChoice.options || [];

        choiceOptions.forEach((option: any) => {
          options.push({
            label: option.label,
            value: option.value,
            count: option.count || 0,
            category: this.mapCategoryToInternal(category) as 'location' | 'property' | 'price' | 'amenities',
            priority: option.count > 100 ? 'high' : option.count > 50 ? 'medium' : 'low',
          });
        });
      }
      // Handle alternative formats the agent might use
      else if (jsonData.filterOptions) {
        // Handle array of string options
        const filterOptions = Array.isArray(jsonData.filterOptions) ? jsonData.filterOptions : [jsonData.filterOptions];
        filterOptions.slice(0, 1).forEach((optionLabel: string) => {
          // Try to match with actual facet data
          const matchedOption = this.findMatchingFacetOption(optionLabel, facetData);
          if (matchedOption) {
            options.push(matchedOption);
          } else {
            // Fallback option
            options.push({
              label: optionLabel,
              value: optionLabel.toLowerCase().replace(/\s+/g, '_'),
              count: 0,
              category: 'location',
              priority: 'medium',
            });
          }
        });
      }
      // Handle other JSON formats (cities, propertyTypes, etc.)
      else {
        const possibleKeys = ['cities', 'propertyTypes', 'priceRange', 'amenities'];
        for (const key of possibleKeys) {
          if (jsonData[key]) {
            const matchedOption = this.findMatchingFacetOption(jsonData[key], facetData, key);
            if (matchedOption) {
              options.push(matchedOption);
              break;
            }
          }
        }
      }

      // If we found options from JSON, return them (limited to 1)
      if (options.length > 0) {
        return options.slice(0, 1);
      }

    } catch (error) {
      console.error('Error parsing agent JSON response:', error, 'Raw message:', agentMessage);
    }
    
    // Always fall back to providing at least one option
    console.warn('JSON parsing failed, using fallback options');
    return this.fallbackParseOptions(agentMessage, facetData);
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

  private findMatchingFacetOption(searchValue: any, facetData: any, categoryHint?: string): FacetOption | null {
    if (!facetData || !searchValue) return null;

    // Try to match with actual facet data
    const searchString = String(searchValue).toLowerCase();

    // Check cities
    if (facetData.cities && (categoryHint === 'cities' || searchString.includes('city') || searchString.includes('location'))) {
      const match = facetData.cities.find((city: any) => 
        city.label.toLowerCase().includes(searchString) || searchString.includes(city.label.toLowerCase())
      );
      if (match) {
        return {
          label: match.label,
          value: match.value,
          count: match.count,
          category: 'location',
          priority: 'high',
        };
      }
      // Return first city if no specific match
      if (facetData.cities.length > 0) {
        return {
          label: facetData.cities[0].label,
          value: facetData.cities[0].value,
          count: facetData.cities[0].count,
          category: 'location',
          priority: 'high',
        };
      }
    }

    // Check property types
    if (facetData.propertyTypes && (categoryHint === 'propertyTypes' || searchString.includes('property') || searchString.includes('type'))) {
      const match = facetData.propertyTypes.find((prop: any) => 
        prop.label.toLowerCase().includes(searchString) || searchString.includes(prop.label.toLowerCase())
      );
      if (match) {
        return {
          label: match.label,
          value: match.value,
          count: match.count,
          category: 'property',
          priority: 'high',
        };
      }
      // Return first property type if no specific match
      if (facetData.propertyTypes.length > 0) {
        return {
          label: facetData.propertyTypes[0].label,
          value: facetData.propertyTypes[0].value,
          count: facetData.propertyTypes[0].count,
          category: 'property',
          priority: 'high',
        };
      }
    }

    return null;
  }

  private fallbackParseOptions(_agentMessage: string, facetData: any): FacetOption[] {
    // Fallback to single option from most relevant category
    // We must ALWAYS provide a filter option unless results are perfect (5 or fewer)
    const options: FacetOption[] = [];

    console.log('Using fallback parsing with facetData:', Object.keys(facetData || {}));

    if (facetData?.cities?.length > 0) {
      const topCity = facetData.cities[0];
      options.push({
        label: topCity.label,
        value: topCity.value,
        count: topCity.count,
        category: 'location',
        priority: 'high',
      });
    } else if (facetData?.propertyTypes?.length > 0) {
      const topProperty = facetData.propertyTypes[0];
      options.push({
        label: topProperty.label,
        value: topProperty.value,
        count: topProperty.count,
        category: 'property',
        priority: 'high',
      });
    } else if (facetData?.roomTypes?.length > 0) {
      const topRoom = facetData.roomTypes[0];
      options.push({
        label: topRoom.label,
        value: topRoom.value,
        count: topRoom.count,
        category: 'property',
        priority: 'high',
      });
    } else {
      // Last resort: create a generic location option
      options.push({
        label: 'All Locations',
        value: '',
        count: 0,
        category: 'location',
        priority: 'medium',
      });
    }

    console.log('Fallback options created:', options);
    return options.slice(0, 1); // Always return exactly one option
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