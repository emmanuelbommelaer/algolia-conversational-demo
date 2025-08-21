import React, { useEffect } from 'react';
import { useSearchBox } from 'react-instantsearch';

/**
 * Component that triggers an initial search to load all data
 * This ensures facets and results are available from the start
 */
export const InitialSearch: React.FC = () => {
  const { refine } = useSearchBox();

  useEffect(() => {
    // Trigger search with empty query to load all data
    refine('');
  }, [refine]);

  return null; // This component doesn't render anything
};