import React from 'react';
import { useSearchBox } from 'react-instantsearch';

export const SearchBox: React.FC = () => {
  const { query } = useSearchBox();

  return (
    <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900">Agent-Guided Search</h3>
          <p className="text-sm text-blue-700">
            Use the guide on the right to find your perfect Airbnb
            {query && ` • Current query: "${query}"`}
          </p>
        </div>
      </div>
    </div>
  );
};