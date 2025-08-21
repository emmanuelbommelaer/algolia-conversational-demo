import React from 'react';
import { useRefinementList, useRange, useClearRefinements } from 'react-instantsearch';

const RefinementList: React.FC<{ attribute: string; title: string }> = ({ attribute, title }) => {
  const { items, refine } = useRefinementList({ attribute });

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        {title}
        <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
          {items.length}
        </span>
      </h3>
      <div className="space-y-3">
        {items.slice(0, 8).map((item) => (
          <label key={item.value} className="flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={item.isRefined}
                onChange={() => refine(item.value)}
                className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
              />
              {item.isRefined && (
                <svg className="absolute inset-0 w-5 h-5 text-blue-600 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors flex-1 flex items-center justify-between">
              <span className="font-medium">{item.label}</span>
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full ml-2">
                {item.count}
              </span>
            </span>
          </label>
        ))}
        {items.length > 8 && (
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Show {items.length - 8} more...
          </button>
        )}
      </div>
    </div>
  );
};

const PriceRange: React.FC = () => {
  const { range, start, refine } = useRange({ attribute: 'price' });
  const [values, setValues] = React.useState(start);

  React.useEffect(() => {
    setValues(start);
  }, [start]);

  const handleChange = (type: 'min' | 'max', value: string) => {
    const newValues = { ...values };
    if (newValues) {
      (newValues as { [K in typeof type]?: number })[type] = value === '' ? undefined : Number(value);
      setValues(newValues);
      refine(newValues);
    }
  };

  if (!range || (!range.min && !range.max)) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        Price Range
        <svg className="ml-2 w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                placeholder={`${range.min || 0}`}
                value={values && typeof values === 'object' && 'min' in values ? String(values.min ?? '') : ''}
                onChange={(e) => handleChange('min', e.target.value)}
                className="w-full pl-8 pr-3 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                placeholder={`${range.max || '∞'}`}
                value={values && typeof values === 'object' && 'max' in values ? String(values.max ?? '') : ''}
                onChange={(e) => handleChange('max', e.target.value)}
                className="w-full pl-8 pr-3 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>
        </div>
        {range && (
          <div className="text-xs text-gray-500 text-center">
            Available range: ${range.min?.toLocaleString()} - ${range.max?.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export const Filters: React.FC = () => {
  const { refine: clearRefinements } = useClearRefinements();

  return (
    <div data-testid="filters" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
        </div>
        <button
          onClick={() => clearRefinements()}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Clear all
        </button>
      </div>

      <div className="space-y-8">
        <RefinementList attribute="room_type" title="Room Type" />
        <RefinementList attribute="property_type" title="Property Type" />
        <RefinementList attribute="city" title="City" />
        <PriceRange />
        <RefinementList attribute="person_capacity" title="Guests" />
        <RefinementList attribute="bedrooms" title="Bedrooms" />
      </div>
    </div>
  );
};