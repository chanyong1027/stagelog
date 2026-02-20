import React from 'react';

interface PerformanceFilterProps {
  selectedFilter: boolean | null;
  onFilterChange: (filter: boolean | null) => void;
}

const PerformanceFilter: React.FC<PerformanceFilterProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const filters = [
    { label: '전체', value: null },
    { label: '페스티벌', value: true },
    { label: '단독 공연', value: false },
  ];

  return (
    <div className="flex gap-3">
      {filters.map((filter) => (
        <button
          key={filter.label}
          onClick={() => onFilterChange(filter.value)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedFilter === filter.value
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default PerformanceFilter;
