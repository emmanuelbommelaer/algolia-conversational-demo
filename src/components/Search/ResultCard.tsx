import React from 'react';
import type { Product } from '../../types';

interface ResultCardProps {
  product: Product;
}

export const ResultCard: React.FC<ResultCardProps> = ({ product }) => {
  // Get the best available image URL
  const imageUrl = product.image || product.xl_picture_url || product.picture_url || product.medium_url || product.thumbnail_url;
  
  // Create a description from available fields
  const description = product.description || 
    `${product.property_type || 'Property'} in ${product.city || 'great location'}${product.neighborhood ? `, ${product.neighborhood}` : ''}`;
  
  // Create category from room_type or property_type
  const category = product.category || product.room_type || product.property_type;
  
  // Use reviews_count as rating if no rating available
  const rating = product.rating || (product.reviews_count ? Math.min(5, Math.max(1, product.reviews_count / 20)) : undefined);
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
      {/* Large Product Image */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={imageUrl || 'https://via.placeholder.com/500x300?text=No+Image'}
          alt={product.name}
          className="w-full h-64 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x300?text=No+Image';
          }}
        />
        {rating && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-md">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {/* Category/Property Type */}
        {category && (
          <div className="mb-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
        )}

        {/* Property Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Property Features */}
        <div className="mb-4 flex flex-wrap gap-2">
          {product.bedrooms && (
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {product.bedrooms} bed{product.bedrooms !== 1 ? 's' : ''}
            </span>
          )}
          {product.bathrooms && (
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {product.bathrooms} bath{product.bathrooms !== 1 ? 's' : ''}
            </span>
          )}
          {product.person_capacity && (
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {product.person_capacity} guest{product.person_capacity !== 1 ? 's' : ''}
            </span>
          )}
          {product.reviews_count && (
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
              {product.reviews_count} reviews
            </span>
          )}
        </div>

        {/* Price and Location */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price?.toLocaleString() || 'N/A'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              per night
            </span>
            {(product.city || product.neighborhood) && (
              <span className="text-xs text-gray-500 mt-1">
                {product.neighborhood || product.city}
              </span>
            )}
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};