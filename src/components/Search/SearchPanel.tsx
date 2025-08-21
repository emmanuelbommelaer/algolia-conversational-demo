import React from 'react';
import { Filters } from './Filters';
import { ResultsList } from './ResultsList';
import { useSearchSync } from '../../hooks/useSearchSync';

export const SearchPanel: React.FC = () => {
  const { resultCount, processingTime } = useSearchSync();
  
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" data-testid="search-panel">
      <div className="flex h-full">
        {/* Filters Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <div className="mb-4">
            {resultCount > 0 && (
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm border">
                {resultCount.toLocaleString()} results found in {processingTime}ms
              </div>
            )}
          </div>
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