import React from 'react';
import { useHits, usePagination, useStats, useInstantSearch } from 'react-instantsearch';
import { ResultCard } from './ResultCard';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import type { Product } from '../../types';

export const ResultsList: React.FC = () => {
  const { hits } = useHits<Product>();
  const { nbHits } = useStats();
  const { status } = useInstantSearch();
  const {
    currentRefinement,
    nbPages,
    refine,
    isFirstPage,
    isLastPage,
  } = usePagination();

  if (status === 'loading' || status === 'stalled') {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Searching...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>Error loading search results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 text-sm text-gray-600">
        {nbHits} results found
      </div>

      {hits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No results found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hits.map((hit) => (
            <ResultCard key={hit.objectID} product={hit} />
          ))}
        </div>
      )}

      {nbPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => refine(currentRefinement - 1)}
            disabled={isFirstPage}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, nbPages) }, (_, i) => {
              const page = currentRefinement - 2 + i;
              if (page < 0 || page >= nbPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => refine(page)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    page === currentRefinement
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page + 1}
                </button>
              );
            }).filter(Boolean)}
          </div>

          <button
            onClick={() => refine(currentRefinement + 1)}
            disabled={isLastPage}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};