import { useEffect } from 'react';
import { useInstantSearch, useSearchBox, useCurrentRefinements } from 'react-instantsearch';
import { useSearch } from '../contexts/SearchContext';

export const useSearchSync = () => {
  const { searchState, updateQuery, updateFilters } = useSearch();
  const { results } = useInstantSearch();
  const { query, refine } = useSearchBox();
  const { items: currentRefinements } = useCurrentRefinements();

  // Sync search query from context to InstantSearch
  useEffect(() => {
    if (searchState.query !== query) {
      refine(searchState.query);
    }
  }, [searchState.query, query, refine]);

  // Sync InstantSearch query changes back to context
  useEffect(() => {
    if (query !== searchState.query) {
      updateQuery(query);
    }
  }, [query, searchState.query, updateQuery]);

  // Sync refinements to context
  useEffect(() => {
    const filters: Record<string, any> = {};
    
    currentRefinements.forEach((refinement) => {
      const { attribute, refinements: values } = refinement;
      if (values.length > 0) {
        if (values.length === 1) {
          filters[attribute] = values[0].value;
        } else {
          filters[attribute] = values.map(v => v.value);
        }
      }
    });

    // Only update if filters have actually changed
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(searchState.filters);
    if (filtersChanged) {
      updateFilters(filters);
    }
  }, [currentRefinements, searchState.filters, updateFilters]);

  return {
    resultCount: results?.nbHits || 0,
    totalPages: results?.nbPages || 0,
    processingTime: results?.processingTimeMS || 0,
  };
};