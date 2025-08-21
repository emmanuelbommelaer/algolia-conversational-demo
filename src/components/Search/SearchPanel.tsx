import React from 'react';
import { Filters } from './Filters';
import { ResultsList } from './ResultsList';

export const SearchPanel: React.FC = () => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" data-testid="search-panel">
      <div className="flex h-full">
        {/* Filters Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <Filters />
        </div>
        
        {/* Results Area */}
        <div className="flex-1 bg-white overflow-y-auto">
          <ResultsList />
        </div>
      </div>
    </div>
  );
};