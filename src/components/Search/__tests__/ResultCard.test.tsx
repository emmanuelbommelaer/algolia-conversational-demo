import { render, screen } from '@testing-library/react';
import { ResultCard } from '../ResultCard';

const mockProduct = {
  objectID: '1',
  name: 'Test Product',
  brand: 'Test Brand',
  price: 99.99,
  rating: 4.5,
  image: 'https://example.com/image.jpg',
  description: 'This is a test product description',
  category: 'Electronics',
  features: ['Feature 1', 'Feature 2'],
  _highlightResult: {
    name: {
      value: 'Test <mark>Product</mark>',
      matchLevel: 'partial' as const,
      matchedWords: ['Product']
    }
  }
};

describe('ResultCard', () => {
  test('renders product information', () => {
    render(<ResultCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
  });

  test('renders product image with alt text', () => {
    render(<ResultCard product={mockProduct} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  test('renders rating stars', () => {
    render(<ResultCard product={mockProduct} />);
    
    const ratingText = screen.getByText('4.5');
    expect(ratingText).toBeInTheDocument();
  });

  test('renders category as badge', () => {
    render(<ResultCard product={mockProduct} />);
    
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  test('renders features', () => {
    render(<ResultCard product={mockProduct} />);
    
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });

  test('handles missing image gracefully', () => {
    const productWithoutImage = { ...mockProduct, image: undefined };
    render(<ResultCard product={productWithoutImage} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  test('handles missing optional fields', () => {
    const minimalProduct = {
      objectID: '2',
      name: 'Minimal Product',
      description: 'Minimal description'
    };
    
    render(<ResultCard product={minimalProduct} />);
    expect(screen.getByText('Minimal Product')).toBeInTheDocument();
    expect(screen.getByText('Minimal description')).toBeInTheDocument();
  });
});