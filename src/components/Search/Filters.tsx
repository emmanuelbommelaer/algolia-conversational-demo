import React from 'react';
import { useRefinementList, useRange, useClearRefinements } from 'react-instantsearch';

const RefinementList: React.FC<{ attribute: string; title: string }> = ({ attribute, title }) => {
  const { items, refine } = useRefinementList({ attribute });

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item.value} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={item.isRefined}
              onChange={() => refine(item.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {item.label} ({item.count})
            </span>
          </label>
        ))}
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
    newValues[type] = value === '' ? undefined : Number(value);
    setValues(newValues);
    refine(newValues);
  };

  if (!range.min && !range.max) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder={`${range.min || 0}`}
          value={values.min || ''}
          onChange={(e) => handleChange('min', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number"
          placeholder={`${range.max || '∞'}`}
          value={values.max || ''}
          onChange={(e) => handleChange('max', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export const Filters: React.FC = () => {
  const { refine: clearRefinements } = useClearRefinements();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={() => clearRefinements()}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear all
        </button>
      </div>

      <RefinementList attribute="category" title="Category" />
      <RefinementList attribute="brand" title="Brand" />
      <PriceRange />
      <RefinementList attribute="features" title="Features" />
    </div>
  );
};