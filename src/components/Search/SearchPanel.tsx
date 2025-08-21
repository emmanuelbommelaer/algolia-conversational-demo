import React from 'react';
import { InstantSearch } from 'react-instantsearch';
import { searchClient, ALGOLIA_INDEX_NAME } from '../../services/algoliaConfig';
import { SearchBox } from './SearchBox';
import { Filters } from './Filters';
import { ResultsList } from './ResultsList';
import { useSearchSync } from '../../hooks/useSearchSync';

const SearchPanelInner: React.FC = () => {
  const { resultCount, processingTime } = useSearchSync();
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-4">
        <SearchBox />
        {resultCount > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {resultCount.toLocaleString()} results ({processingTime}ms)
          </div>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 overflow-y-auto max-h-48 lg:max-h-none">
          <Filters />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ResultsList />
        </div>
      </div>
    </div>
  );
};

export const SearchPanel: React.FC = () => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
        <SearchPanelInner />
      </InstantSearch>
    </div>
  );
};