import React, { createContext, useContext, useState, useCallback } from 'react';
import { SearchState } from '../types';

interface SearchContextType {
  searchState: SearchState;
  updateQuery: (query: string) => void;
  updateFilters: (filters: Record<string, any>) => void;
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

  const updateFilters = useCallback((filters: Record<string, any>) => {
    setSearchState(prev => ({ ...prev, filters, page: 0 }));
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