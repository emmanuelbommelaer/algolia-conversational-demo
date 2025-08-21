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
  title = "Choose an option:",
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

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
      case 'medium':
        return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100';
    }
  };

  // Group options by category
  const groupedOptions = options.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, FacetOption[]>);

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
      
      {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
        <div key={category} className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {category.replace('_', ' ')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {categoryOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(option)}
                className={`flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-colors ${getPriorityStyle(option.priority)}`}
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-xs bg-white bg-opacity-80 px-2 py-1 rounded-full">
                  {option.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};