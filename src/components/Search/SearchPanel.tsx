import React from 'react';
import { InstantSearch } from 'react-instantsearch';
import { searchClient, ALGOLIA_INDEX_NAME } from '../../services/algoliaConfig';
import { SearchBox } from './SearchBox';
import { Filters } from './Filters';
import { ResultsList } from './ResultsList';

export const SearchPanel: React.FC = () => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
        <div className="flex flex-col h-full">
          <div className="border-b border-gray-200 p-4">
            <SearchBox />
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
              <Filters />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ResultsList />
            </div>
          </div>
        </div>
      </InstantSearch>
    </div>
  );
};