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
    <div className="p-6" data-testid="results-list">
      {/* Results Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {nbHits.toLocaleString()} results
          </div>
        </div>
      </div>

      {hits.length === 0 ? (
        <div className="text-center py-20">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <>
          {/* 2 Cards Per Row Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {hits.map((hit) => (
              <ResultCard key={hit.objectID} product={hit} />
            ))}
          </div>

          {/* Enhanced Pagination */}
          {nbPages > 1 && (
            <div className="mt-12 flex items-center justify-center">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => refine(currentRefinement - 1)}
                  disabled={isFirstPage}
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
                >
                  ← Previous
                </button>

                <div className="flex">
                  {Array.from({ length: Math.min(7, nbPages) }, (_, i) => {
                    const page = Math.max(0, Math.min(nbPages - 7, currentRefinement - 3)) + i;
                    if (page < 0 || page >= nbPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => refine(page)}
                        className={`px-4 py-3 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors ${
                          page === currentRefinement
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white hover:bg-gray-50'
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
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};