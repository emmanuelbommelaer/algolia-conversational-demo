import { useEffect, useRef } from 'react';
import { useInstantSearch, useSearchBox, useCurrentRefinements } from 'react-instantsearch';
import { useSearch } from '../contexts/SearchContext';

export const useSearchSync = () => {
  const { updateQuery, updateFilters } = useSearch();
  const { results } = useInstantSearch();
  const { query } = useSearchBox();
  const { items: currentRefinements } = useCurrentRefinements();
  
  // Use refs to track previous values to avoid infinite loops
  const prevQueryRef = useRef<string>('');
  const prevFiltersRef = useRef<string>('');

  // Sync InstantSearch query changes to context (one-way only)
  useEffect(() => {
    if (query !== prevQueryRef.current) {
      prevQueryRef.current = query;
      updateQuery(query);
    }
  }, [query, updateQuery]);

  // Sync InstantSearch refinements to context (one-way only)
  useEffect(() => {
    const filters: Record<string, string | string[] | number | boolean> = {};
    
    currentRefinements.forEach((refinement) => {
      const { attribute, refinements: values } = refinement;
      if (values.length > 0) {
        if (values.length === 1) {
          filters[attribute] = String(values[0].value);
        } else {
          filters[attribute] = values.map(v => String(v.value));
        }
      }
    });

    const filtersJson = JSON.stringify(filters);
    if (filtersJson !== prevFiltersRef.current) {
      prevFiltersRef.current = filtersJson;
      updateFilters(filters);
    }
  }, [currentRefinements, updateFilters]);

  return {
    resultCount: results?.nbHits || 0,
    totalPages: results?.nbPages || 0,
    processingTime: results?.processingTimeMS || 0,
  };
};