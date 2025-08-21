import { useState, useEffect, useCallback } from 'react';
import { useRefinementList, useRange, useInstantSearch } from 'react-instantsearch';
import { useSearch } from '../contexts/SearchContext';
import { guidedSearchAgent } from '../services/guidedSearchAgent';
import type { SearchFlowState, FacetOption } from '../types';

export const useSearchFlow = () => {
  const { searchState, addFilter, removeFilter } = useSearch();
  const { results } = useInstantSearch();
  
  // Get facet data from Algolia
  const cityRefinements = useRefinementList({ attribute: 'city', limit: 10 });
  const propertyTypeRefinements = useRefinementList({ attribute: 'property_type', limit: 8 });
  const roomTypeRefinements = useRefinementList({ attribute: 'room_type', limit: 6 });
  const priceRange = useRange({ attribute: 'price' });

  const [flowState, setFlowState] = useState<SearchFlowState>({
    stage: 'welcome',
    resultCount: 0,
    suggestedOptions: [],
    agentMessage: 'Loading...',
    completedStages: [],
  });
  
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);

  // Update result count when results change
  useEffect(() => {
    const resultCount = results?.nbHits || 0;
    setFlowState(prev => ({ ...prev, resultCount }));
  }, [results]);

  // Get guidance from agent whenever filters or results change
  useEffect(() => {
    const fetchGuidance = async () => {
      if (isLoadingGuidance) return;
      
      setIsLoadingGuidance(true);
      
      try {
        // Prepare facet data for the agent
        const facetData = {
          cities: cityRefinements.items,
          propertyTypes: propertyTypeRefinements.items,
          roomTypes: roomTypeRefinements.items,
          priceRange: priceRange.range,
        };

        const resultCount = results?.nbHits || 0;
        
        // Get guidance from the agent
        const guidance = await guidedSearchAgent.getGuidance(
          searchState.filters,
          resultCount,
          facetData
        );

        setFlowState(prev => ({
          ...prev,
          agentMessage: guidance.message,
          suggestedOptions: guidance.facetOptions,
          stage: (guidance.nextStage || 'welcome') as SearchFlowState['stage'],
          resultCount,
        }));
      } catch (error) {
        console.error('Failed to get agent guidance:', error);
        // Use fallback message on error
        setFlowState(prev => ({
          ...prev,
          agentMessage: "I'm here to help you find the perfect Airbnb. Please select from the options below to get started.",
        }));
      } finally {
        setIsLoadingGuidance(false);
      }
    };

    fetchGuidance();
  }, [searchState.filters, results?.nbHits, cityRefinements.items, propertyTypeRefinements.items, roomTypeRefinements.items, priceRange.range]);


  // Handle option selection
  const selectOption = useCallback((option: FacetOption) => {
    if (option.category === 'location') {
      addFilter('city', option.value);
    } else if (option.category === 'property') {
      // Determine if it's property_type or room_type based on available refinements
      const isPropertyType = propertyTypeRefinements.items.some(item => item.value === option.value);
      addFilter(isPropertyType ? 'property_type' : 'room_type', option.value);
    } else if (option.category === 'price') {
      const [min, max] = option.value.split(':').map(Number);
      addFilter('price', `${min}:${max}`);
    }
  }, [addFilter, propertyTypeRefinements.items]);

  return {
    flowState,
    selectOption,
    removeFilter,
    isLoadingGuidance,
  };
};