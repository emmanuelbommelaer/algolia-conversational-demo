import React from 'react';
import { FacetOptions } from './FacetOptions';
import { useSearchFlow } from '../../hooks/useSearchFlow';
import { useSearch } from '../../contexts/SearchContext';

export const SearchGuide: React.FC = () => {
  const { flowState, selectOption, removeFilter, isLoadingGuidance } = useSearchFlow();
  const { searchState } = useSearch();
  

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'welcome':
        return '👋';
      case 'location':
        return '📍';
      case 'property_type':
        return '🏠';
      case 'price':
        return '💰';
      case 'amenities':
        return '✨';
      case 'refine':
        return '🎯';
      case 'error':
        return '❌';
      default:
        return '🔍';
    }
  };

  const getCurrentFilters = () => {
    return Object.entries(searchState.filters).map(([key, value]) => ({
      key,
      value: Array.isArray(value) ? value.join(', ') : String(value),
      label: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));
  };

  const currentFilters = getCurrentFilters();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
            {getStageIcon(flowState.stage)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Your Search Guide</h2>
            <p className="text-blue-100">Finding your perfect stay</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-100">
            {flowState.resultCount.toLocaleString()} properties found
          </span>
        </div>
      </div>

      {/* Applied Filters */}
      {currentFilters.length > 0 && (
        <div className="p-4 bg-gray-50 border-b">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Preferences:</h4>
          <div className="flex flex-wrap gap-2">
            {currentFilters.map((filter) => (
              <div
                key={filter.key}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span className="font-medium mr-2">{filter.label}:</span>
                <span>{filter.value}</span>
                <button
                  onClick={() => removeFilter(filter.key)}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Message & Options */}
      <div className="flex-1 p-4">
        {/* Agent Message */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex-1">
              {isLoadingGuidance ? (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-gray-500 text-sm">Agent is thinking...</span>
                </div>
              ) : (
                <p className="text-gray-800 leading-relaxed">{flowState.agentMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Facet Options */}
        {flowState.suggestedOptions.length > 0 && !isLoadingGuidance && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <FacetOptions
              options={flowState.suggestedOptions}
              onSelect={selectOption}
              title="Choose from these popular options:"
            />
          </div>
        )}

        {/* Results Summary */}
        {flowState.resultCount === 0 && currentFilters.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-800 text-sm">
                No properties match your current criteria. Try removing some filters or exploring different options.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600">Search Progress</span>
          <span className="text-xs text-gray-500">
            {flowState.stage === 'welcome' ? 'Getting started' : 
             flowState.stage === 'error' ? 'Service unavailable' :
             flowState.stage === 'refine' ? 'Nearly there!' : 
             'Building your search'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              flowState.stage === 'error' 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ 
              width: `${
                flowState.stage === 'welcome' ? '0%' :
                flowState.stage === 'error' ? '100%' :
                flowState.stage === 'location' ? '25%' :
                flowState.stage === 'property_type' ? '50%' :
                flowState.stage === 'price' ? '75%' :
                '100%'
              }` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};