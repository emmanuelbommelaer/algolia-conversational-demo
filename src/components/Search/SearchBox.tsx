import React from 'react';
import { useSearchBox } from 'react-instantsearch';

export const SearchBox: React.FC = () => {
  const { query, refine } = useSearchBox();

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => refine(e.target.value)}
        placeholder="Search products..."
        className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="w-5 h-5 text-gray-400"
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
    </div>
  );
};