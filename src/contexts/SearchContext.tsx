import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SearchState, FilterValue } from '../types';

interface SearchContextType {
  searchState: SearchState;
  updateQuery: (query: string) => void;
  updateFilters: (filters: Record<string, FilterValue>) => void;
  addFilter: (field: string, value: FilterValue) => void;
  removeFilter: (field: string) => void;
  updatePage: (page: number) => void;
  resetSearch: () => void;
}

const initialSearchState: SearchState = {
  query: '',
  filters: {},
  page: 0,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(initialSearchState);

  const updateQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query, page: 0 }));
  }, []);

  const updateFilters = useCallback((filters: Record<string, FilterValue>) => {
    setSearchState(prev => ({ ...prev, filters, page: 0 }));
  }, []);

  const addFilter = useCallback((field: string, value: FilterValue) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, [field]: value },
      page: 0,
    }));
  }, []);

  const removeFilter = useCallback((field: string) => {
    setSearchState(prev => {
      const newFilters = { ...prev.filters };
      delete newFilters[field];
      return { ...prev, filters: newFilters, page: 0 };
    });
  }, []);

  const updatePage = useCallback((page: number) => {
    setSearchState(prev => ({ ...prev, page }));
  }, []);

  const resetSearch = useCallback(() => {
    setSearchState(initialSearchState);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchState,
        updateQuery,
        updateFilters,
        addFilter,
        removeFilter,
        updatePage,
        resetSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};