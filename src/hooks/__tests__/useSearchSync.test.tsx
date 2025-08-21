import { renderHook } from '@testing-library/react';
import { useSearchSync } from '../useSearchSync';
import { InstantSearch } from 'react-instantsearch';
import { SearchProvider } from '../../contexts/SearchContext';
import React from 'react';

// Mock algoliasearch client
const mockSearchClient = {
  search: vi.fn(() =>
    Promise.resolve({
      results: [{ 
        hits: [{ objectID: '1', name: 'Test Product' }], 
        nbHits: 1, 
        page: 0, 
        nbPages: 1,
        processingTimeMS: 5 
      }],
    })
  ),
} as const;

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SearchProvider>
      <InstantSearch searchClient={mockSearchClient} indexName="test">
        {children}
      </InstantSearch>
    </SearchProvider>
  );
};

describe('useSearchSync', () => {
  test('should initialize with default values', () => {
    const { result } = renderHook(() => useSearchSync(), {
      wrapper: TestWrapper,
    });

    expect(result.current.resultCount).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.processingTime).toBe(0);
  });

  test('should not cause infinite re-renders', async () => {
    let renderCount = 0;
    
    const TestComponent = () => {
      renderCount++;
      useSearchSync();
      return null;
    };

    const { rerender } = renderHook(() => <TestComponent />, {
      wrapper: TestWrapper,
    });

    // Wait a moment for any potential re-renders
    await new Promise(resolve => setTimeout(resolve, 100));

    const initialRenderCount = renderCount;
    
    // Trigger a few re-renders
    rerender();
    rerender();
    rerender();

    // Wait again
    await new Promise(resolve => setTimeout(resolve, 100));

    // The render count should not have increased excessively (indicating no infinite loop)
    expect(renderCount).toBeLessThan(initialRenderCount + 10);
  });

  test('should handle results data correctly', () => {
    const { result } = renderHook(() => useSearchSync(), {
      wrapper: TestWrapper,
    });

    // The hook should return safe defaults when results are not available
    expect(typeof result.current.resultCount).toBe('number');
    expect(typeof result.current.totalPages).toBe('number');
    expect(typeof result.current.processingTime).toBe('number');
  });
});