import React from 'react';
import { SearchBox } from './SearchBox';
import { Filters } from './Filters';
import { ResultsList } from './ResultsList';
import { useSearchSync } from '../../hooks/useSearchSync';

export const SearchPanel: React.FC = () => {
  const { resultCount, processingTime } = useSearchSync();
  
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" data-testid="search-panel">
      <div className="flex flex-col h-full bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
          <SearchBox />
          {resultCount > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                {resultCount.toLocaleString()} results found in {processingTime}ms
              </div>
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
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
    </div>
  );
};