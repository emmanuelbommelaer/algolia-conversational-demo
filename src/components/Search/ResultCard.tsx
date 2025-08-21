import React from 'react';
import type { Product } from '../../types';

interface ResultCardProps {
  product: Product;
}

export const ResultCard: React.FC<ResultCardProps> = ({ product }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {product.image && (
        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex items-center text-sm">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>

        {product.brand && (
          <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
        )}

        <p className="text-sm text-gray-700 line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">
            ${product.price?.toLocaleString() || 'N/A'}
          </div>
          
          {product.category && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              {product.category}
            </span>
          )}
        </div>

        {product.features && product.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.features.slice(0, 3).map((feature, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};