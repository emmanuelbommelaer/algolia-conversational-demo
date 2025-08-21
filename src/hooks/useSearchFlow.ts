import { useState, useEffect, useCallback, useRef } from 'react';
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
    error: undefined,
  });
  
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
  const lastCallRef = useRef<string>('');

  // Update result count when results change
  useEffect(() => {
    const resultCount = results?.nbHits || 0;
    setFlowState(prev => ({ ...prev, resultCount }));
  }, [results]);

  // Get guidance from agent whenever filters or results change
  useEffect(() => {
    const fetchGuidance = async () => {
      // Create a unique key for this call to prevent duplicates
      const callKey = JSON.stringify({
        filters: searchState.filters,
        nbHits: results?.nbHits,
        hasFacets: cityRefinements.items.length > 0 || propertyTypeRefinements.items.length > 0 || roomTypeRefinements.items.length > 0
      });
      
      // Skip if this exact same call was just made
      if (lastCallRef.current === callKey) {
        return;
      }
      
      if (isLoadingGuidance) {
        return;
      }
      
      // Update the last call reference
      lastCallRef.current = callKey;
      
      // Wait for facets to load before making guidance requests
      const resultCount = results?.nbHits || 0;
      const hasFacets = cityRefinements.items.length > 0 || propertyTypeRefinements.items.length > 0 || roomTypeRefinements.items.length > 0;
      
      console.log('🔍 Agent guidance request:', {
        resultCount,
        hasFacets,
        cityFacets: cityRefinements.items.length,
        propertyFacets: propertyTypeRefinements.items.length,
        roomFacets: roomTypeRefinements.items.length,
        filters: searchState.filters
      });
      
      // Skip if Algolia hasn't loaded initial data yet
      // We need either results > 0 OR facets loaded to proceed
      if (resultCount === 0 && !hasFacets) {
        console.log('⏸️ Skipping agent call - waiting for Algolia to load initial data');
        return;
      }
      
      // Skip if we have results but no facets loaded yet (still loading)
      if (resultCount > 0 && !hasFacets) {
        console.log('⏸️ Skipping agent call - waiting for facets to load');
        return;
      }
      setIsLoadingGuidance(true);
      
      try {
        // Prepare facet data for the agent
        const facetData = {
          cities: cityRefinements.items,
          propertyTypes: propertyTypeRefinements.items,
          roomTypes: roomTypeRefinements.items,
          priceRange: priceRange.range,
        };
        
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
          error: undefined, // Clear any previous errors
        }));
      } catch (error) {
        console.error('Failed to get agent guidance:', error);
        // Show the agent error in the UI instead of fallback
        const errorMessage = error instanceof Error ? error.message : 'Agent service unavailable';
        setFlowState(prev => ({
          ...prev,
          stage: 'error',
          agentMessage: `⚠️ ${errorMessage}`,
          suggestedOptions: [], // Clear any suggestions
          error: errorMessage,
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