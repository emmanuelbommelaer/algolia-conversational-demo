import React, { createContext, useContext } from 'react';
import type { FilterValue } from '../types';

interface SearchActionsContextType {
  triggerSearch: (query: string) => void;
  applyFilter: (field: string, value: FilterValue) => void;
  clearFilters: () => void;
}

const SearchActionsContext = createContext<SearchActionsContextType | undefined>(undefined);

export const SearchActionsProvider: React.FC<{ 
  children: React.ReactNode;
  actions: SearchActionsContextType;
}> = ({ children, actions }) => {
  return (
    <SearchActionsContext.Provider value={actions}>
      {children}
    </SearchActionsContext.Provider>
  );
};

export const useSearchActions = () => {
  const context = useContext(SearchActionsContext);
  if (!context) {
    throw new Error('useSearchActions must be used within a SearchActionsProvider');
  }
  return context;
};