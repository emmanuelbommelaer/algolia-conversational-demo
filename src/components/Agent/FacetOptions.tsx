import React from 'react';
import type { FacetOption } from '../../types';

interface FacetOptionsProps {
  options: FacetOption[];
  onSelect: (option: FacetOption) => void;
  title?: string;
}

export const FacetOptions: React.FC<FacetOptionsProps> = ({
  options,
  onSelect,
  title = "Choose from these popular options:",
}) => {
  if (options.length === 0) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'location':
        return '📍';
      case 'property':
        return '🏠';
      case 'price':
        return '💰';
      case 'amenities':
        return '✨';
      default:
        return '🔧';
    }
  };

  // For single-choice design, just take the first option (agent should only return one)
  const primaryOption = options[0];
  
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-800 mb-4">{title}</h4>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-3">{getCategoryIcon(primaryOption.category)}</span>
          <span className="text-sm font-medium text-blue-700 uppercase tracking-wide">
            {primaryOption.category.replace('_', ' ')}
          </span>
        </div>
        
        <button
          onClick={() => onSelect(primaryOption)}
          className="w-full bg-white hover:bg-blue-50 text-left px-6 py-4 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-800">
              {primaryOption.label}
            </span>
            <div className="flex items-center">
              <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                {primaryOption.count.toLocaleString()}
              </span>
              <svg className="ml-3 w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
        
        {options.length > 1 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Agent recommendation: Start with this option
          </div>
        )}
      </div>
    </div>
  );
};