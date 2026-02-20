import React from 'react';
import { PerformanceListItem } from '../../types/performance.types';
import PerformanceCard from './PerformanceCard';

interface PerformanceListProps {
  performances: PerformanceListItem[];
}

const PerformanceList: React.FC<PerformanceListProps> = ({ performances }) => {
  if (performances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">공연 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {performances.map((performance) => (
        <PerformanceCard key={performance.id} performance={performance} />
      ))}
    </div>
  );
};

export default PerformanceList;
