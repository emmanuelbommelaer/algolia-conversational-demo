import { renderHook, act } from '@testing-library/react';
import { SearchProvider, useSearch } from '../SearchContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SearchProvider>{children}</SearchProvider>
);

describe('SearchContext', () => {
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    expect(result.current.searchState).toEqual({
      query: '',
      filters: {},
      page: 0,
    });
  });

  test('should update query and reset page', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    act(() => {
      result.current.updateQuery('laptop');
    });

    expect(result.current.searchState.query).toBe('laptop');
    expect(result.current.searchState.page).toBe(0);
  });

  test('should update filters and reset page', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    const filters = { brand: 'Apple', category: 'Electronics' };

    act(() => {
      result.current.updateFilters(filters);
    });

    expect(result.current.searchState.filters).toEqual(filters);
    expect(result.current.searchState.page).toBe(0);
  });

  test('should add a single filter', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    act(() => {
      result.current.addFilter('brand', 'Apple');
    });

    expect(result.current.searchState.filters).toEqual({ brand: 'Apple' });
    expect(result.current.searchState.page).toBe(0);
  });

  test('should add multiple filters', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    act(() => {
      result.current.addFilter('brand', 'Apple');
      result.current.addFilter('category', 'Electronics');
    });

    expect(result.current.searchState.filters).toEqual({
      brand: 'Apple',
      category: 'Electronics',
    });
  });

  test('should remove a filter', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    // Add filters first
    act(() => {
      result.current.addFilter('brand', 'Apple');
      result.current.addFilter('category', 'Electronics');
    });

    // Remove one filter
    act(() => {
      result.current.removeFilter('brand');
    });

    expect(result.current.searchState.filters).toEqual({
      category: 'Electronics',
    });
    expect(result.current.searchState.page).toBe(0);
  });

  test('should update page without resetting other state', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    // Set some initial state
    act(() => {
      result.current.updateQuery('laptop');
      result.current.addFilter('brand', 'Apple');
    });

    // Update page
    act(() => {
      result.current.updatePage(2);
    });

    expect(result.current.searchState.query).toBe('laptop');
    expect(result.current.searchState.filters).toEqual({ brand: 'Apple' });
    expect(result.current.searchState.page).toBe(2);
  });

  test('should reset search to initial state', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });

    // Set some state
    act(() => {
      result.current.updateQuery('laptop');
      result.current.addFilter('brand', 'Apple');
      result.current.updatePage(2);
    });

    // Reset
    act(() => {
      result.current.resetSearch();
    });

    expect(result.current.searchState).toEqual({
      query: '',
      filters: {},
      page: 0,
    });
  });

  test('should throw error when used outside provider', () => {
    // Test that the hook throws an error when used outside provider
    expect(() => {
      renderHook(() => useSearch());
    }).toThrow('useSearch must be used within a SearchProvider');
  });
});