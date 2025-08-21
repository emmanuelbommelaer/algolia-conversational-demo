import { render, screen } from '@testing-library/react';
import { SearchBox } from '../SearchBox';
import { InstantSearch } from 'react-instantsearch';

// Mock algoliasearch to avoid actual network calls
const mockSearchClient = {
  search: vi.fn(() =>
    Promise.resolve({
      results: [{ hits: [], nbHits: 0, page: 0, nbPages: 1, processingTimeMS: 1 }],
    })
  ),
} as const;

describe('SearchBox', () => {
  const renderWithInstantSearch = (component: React.ReactElement) => {
    return render(
      <InstantSearch searchClient={mockSearchClient} indexName="test">
        {component}
      </InstantSearch>
    );
  };

  test('renders search input with correct placeholder', () => {
    renderWithInstantSearch(<SearchBox />);
    
    const searchInput = screen.getByPlaceholderText('Search products, brands, or categories...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  test('renders search icon', () => {
    const { container } = renderWithInstantSearch(<SearchBox />);
    
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  test('input has correct styling classes', () => {
    renderWithInstantSearch(<SearchBox />);
    
    const searchInput = screen.getByPlaceholderText('Search products, brands, or categories...');
    expect(searchInput).toHaveClass('w-full', 'px-6', 'py-4');
  });
});